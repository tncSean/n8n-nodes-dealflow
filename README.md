# n8n-nodes-dealflow

This is an n8n community node for [Deal Flow](https://dealflowplugin.com), a pipeline and deal management plugin for [Mautic](https://mautic.org).

## Installation

In your n8n instance, go to **Settings > Community Nodes** and install:

```
n8n-nodes-dealflow
```

Or install via CLI:

```bash
npm install n8n-nodes-dealflow
```

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

## License

[MIT](LICENSE)
