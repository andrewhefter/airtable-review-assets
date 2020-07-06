import {
  Box,
  Modal,
  Button,
  useGlobalConfig,
  useRecords,
  colorUtils,
  colors,
} from '@airtable/blocks/ui';

import {
  Table,
  Record,
  Field,
} from '@airtable/blocks/models';

import React, { useState } from 'react';

import GalleryItem from './GalleryItem';
import MarkupViewer from './MarkupViewer';

interface ReviewModalProps {
  parentRecord: Record;
  linkedTable: Table;
  linkedRecords: Field;
  onClose: () => unknown;
}

export enum ViewStates {
  GALLERY = "gallery",
  VIEWER = "viewer",
};

export default function ReviewModal(props: ReviewModalProps) {
  const {
    parentRecord,
    linkedTable,
    linkedRecords,
    onClose
  } = props;

  const globalConfig = useGlobalConfig();
  const attachmentId = globalConfig.get('attachmentId') as string;
  const markupId = globalConfig.get('markupId') as string;
  const ratingId = globalConfig.get('ratingId') as string;
  const labelId = globalConfig.get('labelId') as string;
  const notesId = globalConfig.get('notesId') as string;

  const ratingField = linkedTable.getFieldByIdIfExists(ratingId);
  const labelField = linkedTable.getFieldByIdIfExists(labelId);
  const notesField = linkedTable.getFieldByIdIfExists(notesId);

  const [modalView, setModalView] = useState(ViewStates.GALLERY);
  const [activeRecord, setActiveRecord] = useState(null);

  const queryAssetRecords = parentRecord.selectLinkedRecordsFromCell(linkedRecords, { fields: [attachmentId, markupId, ratingId, labelId, notesId] });
  const assetRecords = useRecords(queryAssetRecords);

  const permissions = {
    markupsAllowed: linkedTable.hasPermissionToUpdateRecord(undefined, {
      [markupId]: undefined,
    }),
    ratingsAllowed: linkedTable.hasPermissionToUpdateRecord(undefined, {
      [ratingId]: undefined,
    }),
    labelsAllowed: linkedTable.hasPermissionToUpdateRecord(undefined, {
      [labelId]: undefined,
    }),
    notesAllowed: linkedTable.hasPermissionToUpdateRecord(undefined, {
      [labelId]: undefined,
    }),
  };

  const galleryItems = assetRecords?.map(record => (
    <GalleryItem
        key={record.id}
        table={linkedTable}
        record={record}
        permissions={permissions}
        ratingField={ratingField}
        labelField={labelField}
        notesField={notesField}
        setActiveRecord={recordData => {
            setModalView(ViewStates.VIEWER)
            setActiveRecord(recordData);
        }}
    />
  ));

  return (
    <Modal onClose={onClose} display="flex" alignItems="center" justifyContent="center" style={{backgroundColor: colorUtils.getHexForColor(colors.GRAY_LIGHT_2)}} height="95%">
      {modalView === ViewStates.GALLERY
        ? (<Box>
            <Button icon="x" onClick={onClose}>Close Gallery</Button>
            <Box as='ul' display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" margin={0} padding={3} className="review-assets__gallery-list">
            {galleryItems || 'loading'}
            </Box>
          </Box>)
        : (
            <MarkupViewer
              table={linkedTable}
              record={activeRecord}
              permissions={permissions}
              changeView={() => {
                  setModalView(ViewStates.GALLERY);
                  setActiveRecord(null);
              }}
            />
        )}
    </Modal>
  );
}