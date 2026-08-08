import { registry } from '@/lib/metrics';

export async function GET() {
  const metrics = await registry.metrics();
  return new Response(metrics, {
    headers: { 'Content-Type': registry.contentType },
  });
}