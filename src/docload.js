// And now for patching in docload to look for Server-Timing
import {DocumentLoad} from '../deps/opentelemetry-js-contrib/plugins/web/opentelemetry-plugin-document-load/build/src';
import {captureTraceParentFromPerformanceEntries} from './servertiming';

export class SplunkDocumentLoad extends DocumentLoad {
  _endSpan(span, perforanceNames, entries) {
    if (span && span.name !== 'documentLoad') { // only apply link to document fetch
      captureTraceParentFromPerformanceEntries(entries, span);
    }
    return super._endSpan(span, perforanceNames, entries);
  }
  // To maintain compatibility, getEntries copies out select items from
  // different versions of the performance API into its own structure for the
  // intitial document load (but leaves the entries undisturbed for resource loads).
  _getEntries() {
    const answer = super._getEntries();
    if (answer) {
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries && navEntries[0] && navEntries[0].serverTiming) {
        answer.serverTiming = navEntries[0].serverTiming;
      }
    }
    return answer;
  }
}