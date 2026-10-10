// Deliberately unavailable in every deploy context. Activation requires a
// reviewed code change after docs/PILOT.md gates; no environment flag enables it.
// Do not read the request, log its contents, import the SDK or open storage.
import {disabledPilotInterest} from '../../server/netlify-interest-store.cjs';

export default async function pilotInterest() {
  return disabledPilotInterest();
}
