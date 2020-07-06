import {
  Box,
  Button,
  useGlobalConfig,
  colorUtils,
  colors,
} from '@airtable/blocks/ui';

import {
  Record,
  Table,
} from '@airtable/blocks/models';

import React, { useState, useRef } from 'react';
import CanvasDraw from 'react-canvas-draw';

import { ViewStates } from './ReviewModal';

// TODO
// - Warn user when changes are not saved
// - Auto-save function
// - Warn/confirm when clicking Undo All or Clear
// - Navigation between attachments when viewing individual attachment
// - Include label, ratings, and notes viewing/editing capability
// - Enable changing brush size and color
// - Additional options for downloading images
// - Contact sheet printing functionality

function exportImageToFile(ref) {
  const canvasMarkups = ref.canvas.drawing;
  const { width, height } = canvasMarkups;
  const canvasImage = ref.canvas.grid;
  const ctx = canvasMarkups.getContext('2d');
  const storedImageData = ctx.getImageData(0, 0, width, height)

  const compositeOp = ctx.globalCompositeOperation;

  ctx.globalCompositeOperation = "destination-over";
  ctx.drawImage(canvasImage, 0, 0);

  const imageData = canvasMarkups.toDataURL();

  ctx.clearRect(0, 0, width, height);
  ctx.putImageData(storedImageData, 0, 0);
  ctx.globalCompositeOperation = compositeOp;

  return imageData;
}

interface MarkupViewerProps {
  table: Table;
  record: Record;
  permissions: any;
  changeView: (view: ViewStates) => unknown;
}

export default function MarkupViewer(props: MarkupViewerProps) {
  const { table, record, changeView } = props;
  const { markupsAllowed, ratingsAllowed, labelsAllowed, notesAllowed } = props.permissions;
  const [brushColor, setBrushColor] = useState('rgba(255,0,0,0.8');
  const [brushRadius, setBrushRadius] = useState(3);
  const canvasRef = useRef(null);

  const globalConfig = useGlobalConfig();
  
  const attachmentId = globalConfig.get('attachmentId') as string;
  const markupId = globalConfig.get('markupId') as string;
  const ratingId = globalConfig.get('ratingId') as string;
  const labelId = globalConfig.get('labelId') as string;
  const notesId = globalConfig.get('notesId') as string;

  const attachment = record.getCellValue(attachmentId) as Array<any>;
  const markups = record.getCellValue(markupId)
  const rating = record.getCellValue(ratingId) || 0;
  const label = record.getCellValue(labelId) as { id: string, name: string, color?: any, };
  const notes = record.getCellValue(notesId);
  
  const clientUrl = record.getAttachmentClientUrlFromCellValueUrl(attachment[0].id, attachment[0].thumbnails.full.url);

  const exportMarkups = (ref, srcImg) => {
    const downloadFile = exportImageToFile(ref, "png", srcImg, '#ffffff');
    const downloadNode = document.createElement('a');

    downloadNode.href = downloadFile;
    downloadNode.download = `${record.name}_markups.png`;
    downloadNode.click();

    return;
  }

  const persistMarkups = () => {
    const markupData = canvasRef.current.getSaveData();

    if (markupsAllowed) table.updateRecordAsync(record, { [markupId]: markupData });
  }

  return (
      <Box height="100%" display="flex" alignItems="center" justifyContent="center" flexDirection="column" backgroundColor="#ffffff" borderRadius="6px" borderWidth="thick" borderColor={colorUtils.getHexForColor(colors.GRAY)} padding={3}>
        <Box alignSelf="flex-start">
          <Button icon="left" onClick={() => changeView(ViewStates.GALLERY)}>Back to Gallery</Button>
        </Box>
  
        <Box display="flex" alignItems="center" flexGrow={1}>
          <CanvasDraw
            disabled={!markupsAllowed}
            ref={canvasDraw => (canvasRef.current = canvasDraw)}
            className="markupCanvas"
            imgSrc={clientUrl}
            brushColor={brushColor}
            brushRadius={brushRadius}
            lazyRadius={10}
            saveData={markups}
            width="100%"
            height="auto"
            hideGrid
          />
        </Box>
        
        <Box marginTop="auto" flexGrow={0}>
          {markupsAllowed && (
            <>
              <Button marginX={1} onClick={() => { canvasRef.current.undo() } }>Undo</Button><Button marginX={1} onClick={() => markups ? canvasRef.current.loadSaveData(markups) : canvasRef.current.clear()}>Undo All</Button>
              <Button marginX={1} onClick={() => canvasRef.current.clear()}>Clear</Button>
              <Button variant="primary" marginX={1} onClick={persistMarkups}>Save Progress</Button>
            </>
          )}
            
          <Button variant="danger" marginX={1} onClick={() => exportMarkups(canvasRef.current, clientUrl)}>Download Markups</Button>
        </Box>
      </Box>
  )
}