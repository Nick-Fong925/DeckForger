import json
import urllib.request


def call_webhook(
    server_url: str,
    secret: str,
    upload_id: str,
    job_type: str,
    status: str,
    error: str | None = None,
) -> None:
    payload: dict[str, str] = {
        'upload_id': upload_id,
        'job_type': job_type,
        'status': status,
    }
    if error is not None:
        payload['error'] = error

    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        f'{server_url}/webhooks/job-complete',
        data=data,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {secret}',
        },
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        if resp.status not in (200, 204):
            raise RuntimeError(f'Webhook returned unexpected status {resp.status}')
