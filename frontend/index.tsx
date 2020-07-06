import {
    initializeBlock,
    useBase,
    useRecords,
    useGlobalConfig,
    useViewport,
    useSettingsButton,
    TablePickerSynced,
    FieldPickerSynced,
    ViewPickerSynced,
    RecordCardList,
    Box,
    Label,
    Select,
    Heading,
    Text,
    Icon,
    Button,
    TextButton,
    colors,
    colorUtils,
    loadCSSFromString,
} from '@airtable/blocks/ui';

import {
    FieldType,
} from '@airtable/blocks/models';

import React, { useState } from 'react';
import ReviewModal from './ReviewModal';

const DummySelect = ({ text }) => (
  <Select
    options={[{ value: `Pick a ${text}...`, label: `Pick a ${text}...` }]}
    value={`Pick a ${text}...`}
    disabled={true}
    marginBottom={2}
  />
);

loadCSSFromString(`
  .review-assets__gallery-list::after {
    content: "";
    flex: auto;
  }

  .review-assets__gallery-item-card {
    list-style: none;
  }

  .rating-annotate-button {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
  };
  
  .rating-annotate-button:hover svg,
  .rating-annotate-button:hover svg path, {
    fill: ${colorUtils.getHexForColor(colors.YELLOW_LIGHT_1)} !important;
  }
`);

function AssetReviewBlock() {
  // init

  const base = useBase();
  const globalConfig = useGlobalConfig();
  const viewport = useViewport();
  


  // Global Config

  const tableId = globalConfig.get('projectTableId') as string;
  const viewId = globalConfig.get('projectViewId') as string;
  const linkedRecordId = globalConfig.get('linkedRecordId') as string;
  const attachmentId = globalConfig.get('attachmentId') as string;
  const markupId = globalConfig.get('markupId') as string;



  // Models

  const table = base.getTableByIdIfExists(tableId);
  const view = viewId && table.getViewByIdIfExists(viewId);
  const records = useRecords(view || table);
  const linkedRecords = table?.getFieldByIdIfExists(linkedRecordId);
  const linkedTable = base.getTableByIdIfExists(linkedRecords?.options?.linkedTableId as string);    



  // Block State

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShowSettings, setIsShowSettings] = useState(false);



  // Event Handlers

  const handleRecordClick = record => {
      setSelectedRecord(record);
      viewport.enterFullscreenIfPossible();
      setIsModalOpen(true);
  }

  useSettingsButton(() => setIsShowSettings(!isShowSettings));



  // Settings panel

  const settings = (
    <Box flexGrow={1} flexShrink={0} width="40%" height="400px" borderLeft="thick" overflowY="auto">
        <Box padding={3}>
          <Heading as='h3'>Settings</Heading>
          <Heading as='h4' size="small" marginBottom={2}>Project Table Options</Heading>
          
          <Label htmlFor="review-table-picker">Table</Label>
          <TablePickerSynced
            globalConfigKey="projectTableId"
            name="review-table-picker"
            id="review-table-picker"
            marginBottom={2}
          />

          <Label htmlFor="review-view-picker">View</Label>
          {table
            ? (
              <ViewPickerSynced
                table={table}
                globalConfigKey="projectViewId"
                name="review-view-picker"
                id="review-view-picker"
                marginBottom={2}
              />
            )
            : (<DummySelect text="view" />)
          }

          <Label htmlFor="linked-record-field-picker">Linked Asset Records</Label>
          {table
            ? (
              <FieldPickerSynced
                allowedTypes={[FieldType.MULTIPLE_RECORD_LINKS]}
                table={table}
                globalConfigKey="linkedRecordId"
                name="linked-record-field-picker"
                id="linked-record-field-picker"
                marginBottom={2}
              />
            )
            : (<DummySelect text="linked record field" />)
          }
          
  
          
          
          {/* ASSET FIELD PICKERS */}
          
          <Heading as='h4' size="small" marginTop={3}>Asset Table Options</Heading>
          <Text size="small" marginBottom={3}>Target Table: {linkedTable?.name || 'None selected'}</Text>
          <Label htmlFor="attachmentFieldPicker">Attachments<span style={{color: 'red'}}>*</span></Label>
          {linkedTable
            ? (
              <FieldPickerSynced
                allowedTypes={[FieldType.MULTIPLE_ATTACHMENTS]}
                table={linkedTable}
                globalConfigKey="attachmentId"
                name="attachment-field-picker"
                id="attachment-field-picker"
                marginBottom={2}
              />
            )
            : (<DummySelect text="attachment field" />)
          }

          <Label htmlFor="rating-field-picker">Markups <small><em>(Long Text Field Type)</em></small></Label>
          {linkedTable
            ? (
              <FieldPickerSynced
                allowedTypes={[FieldType.MULTILINE_TEXT]}
                table={linkedTable}
                globalConfigKey="markupId"
                name="markup-field-picker"
                id="markup-field-picker"
                marginBottom={2}
              />
            )
            : (<DummySelect text="markup field" />)
          }

          <Label htmlFor="rating-field-picker">Rating <small><em>(Rating Field Type)</em></small></Label>
          {linkedTable
            ? (
              <FieldPickerSynced
                allowedTypes={[FieldType.RATING]}
                table={linkedTable}
                globalConfigKey="ratingId"
                name="rating-field-picker"
                id="rating-field-picker"
                marginBottom={2}
              />
            )
            : (<DummySelect text="rating field" />)
          }

          <Label htmlFor="label-field-picker">Label <small><em>(Select Field Type)</em></small></Label>
          {linkedTable
            ? (
              <FieldPickerSynced
                allowedTypes={[FieldType.SINGLE_SELECT]}
                table={linkedTable}
                globalConfigKey="labelId"
                name="label-field-picker"
                id="label-field-picker"
                marginBottom={2}
              />
            )
            : (<DummySelect text="single select field" />)
          }

          <Label htmlFor="notes-field-picker">Notes <small><em>(Text Field Type)</em></small></Label>
          {linkedTable
            ? (
                <FieldPickerSynced
                  allowedTypes={[
                    FieldType.RICH_TEXT,
                    FieldType.SINGLE_LINE_TEXT,
                    FieldType.MULTILINE_TEXT
                  ]}
                  table={linkedTable}
                  globalConfigKey="notesId"
                  name="notes-field-picker"
                  id="notes-field-picker"
                  marginBottom={2}
                />
            )
            : (<DummySelect text="text field" />)
          }
        </Box>

        <Box as='footer' display="flex" justifyContent="flex-end" marginTop={3} padding={3} position="sticky" bottom={0} backgroundColor="white" borderTop="default">
          <TextButton variant="light" marginRight={3} onClick={() => setIsShowSettings(false)}>
            Close
          </TextButton>
          <Button
            variant="primary"
            onClick={() => setIsShowSettings(false)}
            disabled={!table || !linkedTable}
          >
            Done
          </Button>
        </Box>
      </Box>
    );

    return (
      <Box display="flex" flexWrap="wrap">
        {(table && attachmentId && markupId)
          ? (
            <Box height="400px" flexGrow={1} flexShrink={1} width="50%" padding={3}>        
              <Heading as='h3'>{table.name}</Heading>
              <p>Click a record to review, rate, label, and annotate each attachment</p>
              
              <RecordCardList
                records={records}
                view={view}
                onRecordClick={handleRecordClick}
              />
            </Box>
          )
          : (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height="400px"
              width="50%"
              flexGrow={1}
              flexShrink={1}
            >
              <Box textAlign="center">
                <Icon name="warning" size={20} marginBottom={3} />
                <Text size="xlarge" marginBottom={2}>
                  Select a Table and linked Attachment Fields
                </Text>
                {!isShowSettings && (
                  <Button onClick={() => setIsShowSettings(true)}>
                    Update Settings
                  </Button>
                )}
              </Box>
            </Box>
          )}
        
        {isShowSettings && settings}
        
        <Box width="100%" padding={3} borderTop="thick">
            <Heading as="h2" marginTop={3}>Asset Review Block</Heading>
            <ul>
                <li>Render a list of records from a parent table (representing a collection), in conjuction with Linked Records representing visual assets in a child table (using the Attachments field).</li>
                <li>Examples of Collections: Photo Shoots, Design Projects, Art Galleries.</li>
                <li>User selects a Table, then the Lookup Field of the Attachments to be reviewed. Optionally, can set the View for the primary table.</li>
                <li>Clicking a collection renders modal for browsing assets attached to the selected record.</li>
                <li>Modal displays grid of attachments. Click on the attachments will switch to paginated viewer.</li>
                <li>Each asset page contains UI for annotating, using Ratings, Labels, and Notes. Interactivity with the asset supports drawing input.</li>
            </ul>
        </Box>

        {selectedRecord && isModalOpen && (
          <ReviewModal
            parentRecord={selectedRecord}
            linkedTable={linkedTable}
            linkedRecords={linkedRecords}
            onClose={() => { setIsModalOpen(false); }}
          />
        )}
      </Box>
    );
}

initializeBlock(() => <AssetReviewBlock />);
