import { SlideDefinition } from '../types/slides';

/** A picture under the title. Swap the placeholder for
 *  `<img src={importedUrl} alt="…" loading="lazy" />` or a muted looping `<video>`. */
export const LayoutImage: SlideDefinition = {
  id: 'layout-image',
  title: 'A picture or a screen recording',
  content: (
    <div className="ww-image">
      <div className="ww-image__placeholder">Image / video goes here</div>
    </div>
  ),
};
