import { api } from '../utils/api';
import { isObj, pickStr } from '../utils/normalize';

export async function checkHealth(): Promise<boolean> {
  const { data } = await api.get('/api/health', { timeout: 6000, silent: true });
  if (isObj(data)) {
    const status = pickStr(data, 'status');
    return !status || status.toUpperCase() === 'UP' || status.toUpperCase() === 'OK';
  }
  return true;
}