# n8n-nodes-dealflow

This is an n8n community node for [Deal Flow](https://dealflowplugin.com), a pipeline and deal management plugin for [Mautic](https://mautic.org).

## Installation

In your n8n instance, go to **Settings > Community Nodes** and install:

```
n8n-nodes-dealflow
```

Or install via CLI (self-hosted n8n, from the n8n user folder):

```bash
npm install n8n-nodes-dealflow
```

## Compatibility

- Deal Flow plugin 0.9.x
- Mautic 7.x
- n8n with community nodes enabled (`n8nNodesApiVersion` 1)

## Prerequisites

- A Mautic instance with the [Deal Flow plugin](https://dealflowplugin.com) installed
- API Basic Auth enabled in Mautic (Configuration > API Settings)
- A Mautic user with API access

## Credentials

1. In n8n, create new credentials of type **Deal Flow API**
2. Enter your Mautic base URL (e.g., `https://mautic.example.com`)
3. Enter your Mautic username and password

## Resources & Operations

### Deal
- **Create** a new deal
- **Get** a deal by ID
- **Get All** deals with filters (pipeline, status, search, owner, company)
- **Update** an existing deal
- **Move Stage** to change a deal's pipeline stage

### Note
- **Create** a note on a deal

### Task
- **Create** a task on a deal
- **Update** an existing task

### Contact
- **Add** a contact to a deal (with optional role label for Buying Committee tracking)

### Timeline
- **Get** the full timeline/audit trail for a deal

## Dynamic Dropdowns

Pipeline and stage fields use dynamic dropdowns that load options from your Mautic instance. The stage dropdown filters based on the selected pipeline.

## API Documentation

Full API documentation is available at [dealflowplugin.com/docs/api](https://dealflowplugin.com/docs/api).

## Known issues (fixed in 0.2.0)

Version 0.1.x has four bugs that return or save the wrong data without raising an error. All four are fixed in 0.2.0. Until then, use the workaround shown.

1. **Get Timeline returns one item instead of one per event.** The whole timeline arrives as a single array in one item, so the next node sees one broken item. Workaround: call `GET /api/dealflow/deals/{id}/timeline` with an HTTP Request node (same Mautic credentials), then add a Split Out node on `timeline`.
2. **A value of 0 or an empty field is ignored.** Setting Amount, Confidence, or Owner to `0`, or clearing a field, is dropped from the request, and the deal keeps its old value. Workaround: make that change in the Mautic UI.
3. **Create Note and Create Task return the whole deal.** The new note or task ID is not in the output, so a workflow cannot create a task and then update it. Workaround: none in the node. Update tasks from a workflow that already holds the task ID.
4. **Get Many Deals returns only the default pipeline and does not page.** With two or more pipelines, deals in the others are missing and no error appears. Return All does not fetch every page. Workaround: set the Pipeline filter explicitly and run the node once per pipeline.

## License

[MIT](LICENSE)
