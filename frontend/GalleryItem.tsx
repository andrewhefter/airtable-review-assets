import {
    Box,
    Heading,
    Select,
    Button,
    Icon,
    colorUtils,
    colors,
    useGlobalConfig,
} from '@airtable/blocks/ui';

import {
  Table,
  Record,
  Field,
} from '@airtable/blocks/models';

import {
    Color,
} from '@airtable/blocks/types';

import React, { useRef } from 'react';
import CanvasDraw from 'react-canvas-draw';

interface GalleryItemProps {
  table: Table;
  record: Record;
  ratingField?: Field;
  labelField?: Field;
  notesField?: Field;
  permissions: any;
  setActiveRecord: (recordData: Record) => unknown;
}

interface ChoiceOption {
    id?: string;
    name: string;
    color?: Color;
}

function RatingButton({ icon, color, num, isFilled, handleClick }) {
  return (
    <button className="rating-annotate-button" type="button" data-rating={num} onClick={handleClick}>
      <Icon
        className='rating-annotate-button__icon'
        style={{pointerEvents: "none"}}
        name={icon}
        fillColor={isFilled ? colorUtils.getHexForColor(color) : colorUtils.getHexForColor(colors.GRAY_LIGHT_2)}
      />
    </button>
  )
}

export default function GalleryItem(props: GalleryItemProps) {
  const { table, record, ratingField = null, labelField = null, notesField = null, setActiveRecord } = props;
  const { markupsAllowed, notesAllowed, labelsAllowed, ratingsAllowed } = props.permissions;

  const canvasRef = useRef(null);

  const globalConfig = useGlobalConfig();
  
  const attachmentId = globalConfig.get('attachmentId') as string;
  const markupsId = globalConfig.get('markupId') as string;
  const ratingId = globalConfig.get('ratingId') as string;
  const labelId = globalConfig.get('labelId') as string;
  const notesId = globalConfig.get('notesId') as string;

  const attachment = record.getCellValue(attachmentId);
  const markups = record.getCellValue(markupsId);
  const rating = record.getCellValue(ratingId) || 0;
  const label = record.getCellValue(labelId) as { id: string, name: string, color?: Color, };
  const notes = record.getCellValue(notesId);
  
  const clientUrl = record.getAttachmentClientUrlFromCellValueUrl(attachment[0].id, attachment[0].url);

  const { icon, color, max } = ratingField?.options;
  const ratingArray = max && [...Array(max).keys()];

  const labelChoices = labelField?.options?.choices as Array<ChoiceOption>;
  const labelOptions = labelChoices.map(choice => ({ value: choice.id, label: choice.name }));
  const currentLabel = label?.id || "";

  const handleRating = (e: Event) => {
      e.preventDefault();

      const target = e.target as HTMLElement;  
      const selectedRating = +target.dataset.rating;
      const updateRating = rating === selectedRating ? 0 : selectedRating;

      if (ratingsAllowed) table.updateRecordAsync(record.id, {[ratingId]: updateRating});
  }

  const handleLabel = (nextChoice: string) => {
    if (labelsAllowed) table.updateRecordAsync(record.id, { [labelId]: {
      id: nextChoice }});
  }

  const ratingInput = ratingArray.map(num => {
    const currentNumber = num+1;

    return (
      <RatingButton
        key={currentNumber}
        icon={icon}
        color={color}
        num={currentNumber}
        isFilled={currentNumber <= rating}
        handleClick={handleRating}
      />
    );
  });

  return (
    <Box
      as='li'
      display="flex"
      flexDirection="column-reverse"
      flex="0 1 18%"
      marginLeft={2}
      marginRight={2}
      border="thick"
      borderRadius="6px"
      borderColor={colorUtils.getHexForColor(colors.GRAY_LIGHT_1)}
      padding={3}
      backgroundColor="#ffffff"
      className="review-assets__gallery-item-card"
    >
      <Box marginTop={2}>
        <Heading as='h4' size="small">{record.name}</Heading>
        <Box display="flex">{ratingInput}</Box>
        <Select
          options={labelOptions}
          value={currentLabel}
          onChange={handleLabel}
          disabled={!labelsAllowed}
        />
        <Button
          icon="edit"
          variant="primary"
          size="small"
          marginTop={3}
          onClick={() => setActiveRecord(record)}
        >
          View/Edit Markups
        </Button>
      </Box>
  
      <CanvasDraw
        disabled
        hideGrid
        ref={canvasDraw => (canvasRef.current = canvasDraw)}
        saveData={markups}        
        imgSrc={clientUrl}
        width="100%"
        height="auto"
      />
    </Box>
  );
}