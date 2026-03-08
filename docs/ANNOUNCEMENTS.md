# Announcements

BMA supports showing a popup announcement to all users — for example, to warn about upcoming maintenance. The announcement can be **updated without redeploying** the application.

## How It Works

The frontend fetches `/announcement.json` on every page load and every 3 hours while the page is open. If the file contains an active announcement, a popup is shown. Users can dismiss it; the dismissal is remembered (via `localStorage`) until the announcement `id` changes.

## JSON Format

```json
{
  "active": true,
  "id": "2026-03-maintenance",
  "message": "BMA will be offline for maintenance on March 5th, 10:00–12:00 UTC."
}
```

| Field     | Type    | Description |
|-----------|---------|-------------|
| `active`  | boolean | `true` to show the popup, `false` to hide it |
| `id`      | string  | Unique identifier. Change this to force the popup to reappear for users who dismissed a previous announcement |
| `message` | string  | HTML-safe text shown in the popup |

## Editing the Announcement

### Option A: Edit the Host-Side File (Recommended)

In production, `config/announcement.json` on the Docker host is volume-mounted into the container. Edit it directly:

```bash
# On the Docker host, in the repo/deployment directory:
nano config/announcement.json
```

Changes take effect immediately — no container restart needed. Users will see the new announcement on their next page load or within 3 hours if they keep the page open.

### Option B: Edit Inside a Running Container

If you are not using the volume mount (e.g. standalone Docker without Compose), you can edit the file inside the running container:

```bash
# Find the container name/ID
docker ps

# Open a shell inside the container
docker exec -it bma-production-app /bin/bash

# Edit the announcement file (the container uses Debian, so use available editors)
# Install an editor if needed:
apt-get update && apt-get install -y nano

# Edit the file
nano /app/wwwroot/announcement.json

# Or, overwrite it directly without an editor:
cat > /app/wwwroot/announcement.json << 'EOF'
{
  "active": true,
  "id": "2026-03-maintenance",
  "message": "BMA will be offline for maintenance on March 5th."
}
EOF

# Exit the container shell
exit
```

> **Note:** Changes made inside the container are lost when the container is rebuilt or replaced. For persistent changes, use Option A (volume mount) or commit the change to the repo.

### Option C: One-Liner (No Shell Required)

You can pipe the new content directly into the container without opening a shell:

```bash
echo '{"active":true,"id":"2026-03-maint","message":"Maintenance on March 5th."}' \
  | docker exec -i bma-production-app tee /app/wwwroot/announcement.json > /dev/null
```

## Clearing an Announcement

Set `active` to `false` (or delete the message):

```bash
echo '{"active":false,"id":"","message":""}' \
  | docker exec -i bma-production-app tee /app/wwwroot/announcement.json > /dev/null
```

Or, if using the volume mount:

```bash
echo '{"active":false,"id":"","message":""}' > config/announcement.json
```
