`# Hierarchical Collections API Documentation

This document describes the API endpoints for managing hierarchical collections (folders) and files in the Reggie system.

## Base URL
```
/api/v1/
```

## Authentication
All endpoints require authentication. Use JWT tokens or session authentication.

## Collections (Folders) API

### 1. List Collections (Root Level)
**GET** `/api/v1/collections/`

Returns a list of root-level collections accessible to the user.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Australian Regulations",
    "description": "Collection of Australian regulatory documents",
    "collection_type": "folder",
    "jurisdiction": null,
    "regulation_number": null,
    "effective_date": null,
    "sort_order": 0,
    "children": [
      {
        "id": 2,
        "name": "Corporate Tax Act 2001",
        "collection_type": "act",
        "children": []
      }
    ],
    "full_path": "Australian Regulations",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### 2. Get Collection Details
**GET** `/api/v1/collections/{id}/`

Returns detailed information about a collection including files and subcollections.

**Response:**
```json
{
  "id": 1,
  "name": "Australian Regulations",
  "description": "Collection of Australian regulatory documents",
  "collection_type": "folder",
  "children": [...],
  "files": [
    {
      "uuid": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Tax Guide 2024",
      "description": "Comprehensive tax guide",
      "file_type": "pdf",
      "collection_order": 1
    }
  ],
  "full_path": "Australian Regulations"
}
```

### 3. Create Folder/Collection
**POST** `/api/collections/create-folder/`

Creates a new folder/collection.

**Request Body:**
```json
{
  "name": "New Folder",
  "description": "Optional description",
  "parent_id": 1,  // Optional - ID of parent collection
  "collection_type": "folder",  // folder, regulation, act, guideline, manual
  "jurisdiction": "Australia",  // Optional
  "regulation_number": "2024",  // Optional
  "effective_date": "2024-01-01",  // Optional
  "sort_order": 0  // Optional
}
```

**Response:** `201 Created`
```json
{
  "id": 3,
  "name": "New Folder",
  "description": "Optional description",
  "collection_type": "folder",
  "parent": 1,
  "children": [],
  "full_path": "Australian Regulations/New Folder"
}
```

### 4. Move Collection
**POST** `/api/collections/{id}/move-to/`

Moves a collection to a different parent collection.

**Request Body:**
```json
{
  "new_parent_id": 2  // null to move to root level
}
```

**Response:** `200 OK`
```json
{
  "message": "Collection \"New Folder\" moved successfully",
  "new_parent": "Corporate Tax Act 2001"
}
```

### 5. Add Files to Collection
**POST** `/api/collections/{id}/add-files/`

Adds existing files to a collection.

**Request Body:**
```json
{
  "file_ids": ["123e4567-e89b-12d3-a456-426614174000", "987fcdeb-51a2-43d1-b789-123456789abc"]
}
```

**Response:** `200 OK`
```json
{
  "message": "Added 2 files to collection \"New Folder\"",
  "added_count": 2
}
```

### 6. Reorder Files in Collection
**POST** `/api/collections/{id}/reorder-files/`

Reorders files within a collection.

**Request Body:**
```json
{
  "file_orders": [
    {"file_id": "123e4567-e89b-12d3-a456-426614174000", "order": 1},
    {"file_id": "987fcdeb-51a2-43d1-b789-123456789abc", "order": 2}
  ]
}
```

**Response:** `200 OK`
```json
{
  "message": "Files reordered successfully"
}
```

### 7. Get Collection Tree
**GET** `/api/collections/tree/`

Returns the complete hierarchical tree structure of collections.

## Files API

### 1. List Files
**GET** `/api/files/`

Returns a list of files accessible to the user.

**Query Parameters:**
- `scope`: `mine`, `global`, `team`, `all` (default: `all`)
- `user_id`: Required if `scope=user`
- `collection_id`: Filter by collection

**Response:**
```json
[
  {
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Tax Guide 2024",
    "description": "Comprehensive tax guide",
    "file_type": "pdf",
    "collection": {
      "id": 1,
      "name": "Australian Regulations"
    },
    "collection_order": 1,
    "volume_number": 1,
    "part_number": "Part A"
  }
]
```

### 2. Upload Files
**POST** `/api/files/`

Uploads one or more files.

**Request Body (multipart/form-data):**
```
files: [file1.pdf, file2.docx]
title: "Optional title"
description: "Optional description"
team: 1
auto_ingest: false
knowledgebase_id: "kb_123"
is_global: false
collection_name: "Optional collection name"
collection_description: "Optional collection description"
collection_type: "folder"
folder_path: "Australian Regulations/Corporate Tax Act 2001"
jurisdiction: "Australia"
regulation_number: "2001"
```

**Response:** `201 Created`
```json
{
  "message": "Successfully uploaded 2 files",
  "files": [
    {
      "uuid": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Tax Guide 2024",
      "status": "uploaded"
    }
  ]
}
```

### 3. Move Files Between Collections
**POST** `/api/files/move-to-collection/`

Moves files to a different collection.

**Request Body:**
```json
{
  "file_ids": ["123e4567-e89b-12d3-a456-426614174000", "987fcdeb-51a2-43d1-b789-123456789abc"],
  "target_collection_id": 2  // null to move to root level
}
```

**Response:** `200 OK`
```json
{
  "message": "Moved 2 files to collection \"Corporate Tax Act 2001\"",
  "moved_count": 2
}
```

### 4. Get File Details
**GET** `/api/files/{uuid}/`

Returns detailed information about a specific file.

### 5. Update File
**PUT/PATCH** `/api/files/{uuid}/`

Updates file metadata.

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "collection_order": 2
}
```

### 6. Delete File
**DELETE** `/api/files/{uuid}/`

Deletes a file.

## Collection Types

The system supports the following collection types:

- **`folder`**: General purpose folder
- **`regulation`**: Regulatory document collection
- **`act`**: Legislative act collection
- **`guideline`**: Guideline document collection
- **`manual`**: Manual or handbook collection

## File Organization Features

### Hierarchical Structure
- Collections can have unlimited nesting levels
- Each collection can contain both files and subcollections
- Files maintain order within collections via `collection_order`

### Multi-Volume Support
- Files support `volume_number` for multi-volume documents
- Files support `part_number` for document sections
- Automatic ordering by volume, part, and collection order

### Metadata Support
- Collections can have jurisdiction, regulation number, and effective date
- Files maintain ownership, team, and visibility settings
- Support for global files accessible to all users

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses include a descriptive message:
```json
{
  "error": "Description of the error"
}
```

## Frontend Integration Examples

### Create a Folder Structure
```javascript
// Create root folder
const rootFolder = await api.post('/api/collections/create-folder/', {
  name: 'Australian Regulations',
  description: 'Collection of Australian regulatory documents',
  collection_type: 'folder'
});

// Create subfolder
const subFolder = await api.post('/api/collections/create-folder/', {
  name: 'Corporate Tax Act 2001',
  parent_id: rootFolder.id,
  collection_type: 'act',
  jurisdiction: 'Australia',
  regulation_number: '2001'
});
```

### Upload Files to Collection
```javascript
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);
formData.append('collection_name', 'Tax Documents');
formData.append('collection_type', 'folder');
formData.append('jurisdiction', 'Australia');

const response = await api.post('/api/files/', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

### Move Files Between Collections
```javascript
await api.post('/api/files/move-to-collection/', {
  file_ids: ['uuid1', 'uuid2'],
  target_collection_id: 5
});
```

### Get Hierarchical Structure
```javascript
const collections = await api.get('/api/collections/tree/');
// This returns the complete tree structure
```

## Best Practices

1. **Use the tree endpoint** for displaying the full folder structure
2. **Create collections before uploading files** to maintain organization
3. **Use appropriate collection types** for better categorization
4. **Handle errors gracefully** - check response status codes
5. **Use bulk operations** when moving multiple files
6. **Cache collection data** to reduce API calls
7. **Implement proper loading states** for async operations

## Rate Limiting

- Standard rate limiting applies to all endpoints
- File uploads may have additional restrictions
- Consider implementing client-side throttling for bulk operations
`