import { Wordmark } from './Wordmark';
import { OpenNow } from './OpenNow';

export function TopBar() {
  return (
    <header className="flex justify-between items-center px-5 md:px-8 py-4 border-b border-line">
      <Wordmark />
      <OpenNow />
    </header>
  );
}
