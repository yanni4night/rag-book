
import prettyMilliseconds from 'pretty-ms';

export const prettyDuration = function(ms: number): string {
    return prettyMilliseconds(ms);
}