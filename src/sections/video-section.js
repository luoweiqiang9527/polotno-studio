import React from 'react';
import { InputGroup } from '@blueprintjs/core';
import { ImagesGrid } from 'polotno/side-panel/images-grid';
import { getVideoSize } from 'polotno/utils/video';
import { SectionTab } from 'polotno/side-panel';
import { useInfiniteAPI } from 'polotno/utils/use-api';
import { t } from 'polotno/utils/l10n';
import { Video } from '@blueprintjs/icons';

// this is a demo key just for that project
// (!) please don't use it in your projects
// to create your own API key please go here: https://polotno.com/login
const key = 'nFA5H9elEytDyPyvKL7T';

// use Polotno API proxy into Pexels
// WARNING: don't use on production! Use your own proxy and Pexles API key
// const API = "https://api.polotno.com/api";
const API = 'https://api.polotno.com/api/pexels/videos';

const getPexelsVideoAPI = ({ query, page }) =>
  `${API}/${
    query ? 'search' : 'popular'
  }?query=${query}&per_page=20&page=${page}&KEY=${key}`;

export const VideosPanel = ({ store }) => {
  const { setQuery, loadMore, isReachingEnd, data, isLoading, error } =
    useInfiniteAPI({
      defaultQuery: '',
      getAPI: ({ page, query }) => getPexelsVideoAPI({ page, query }),
      getSize: (lastResponse) =>
        lastResponse.total_results / lastResponse.per_page,
    });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <InputGroup
        leftIcon="search"
        placeholder={t('sidePanel.searchPlaceholder')}
        onChange={(e) => {
          setQuery(e.target.value);
        }}
        type="search"
        style={{
          marginBottom: '20px',
        }}
      />
      <p style={{ textAlign: 'center' }}>
        Videos by{' '}
        <a href="https://www.pexels.com/" target="_blank">
          Pexels
        </a>
      </p>
      <ImagesGrid
        images={data
          ?.map((item) => item.videos)
          .flat()
          .filter(Boolean)}
        getPreview={(image) => image.image}
        onSelect={async (image, pos, element) => {
          const src =
            image.video_files.find((f) => f.quality === 'hd')?.link ||
            image.video_files[0].link;
          // // get url of image
          // const src = image.src.large;

          // // if we dropped image into svg element, le't apply mask for it
          // if (element && element.type === 'svg' && element.contentEditable) {
          //   element.set({ maskSrc: src });
          //   return;
          // }

          // // get image size
          const { width, height } = await getVideoSize(src);

          // // if we dropped into another image, let's just recalucate crop and apply new image
          // if (element && element.type === 'image' && element.contentEditable) {
          //   const crop = getCrop(element, {
          //     width,
          //     height,
          //   });
          //   element.set({ src, ...crop });
          //   return;
          // }

          // // otherwise let's create new image
          const x = (pos?.x || store.width / 2) - width / 2;
          const y = (pos?.y || store.height / 2) - height / 2;
          store.activePage?.addElement({
            type: 'video',
            src,
            width,
            height,
            x,
            y,
          });
        }}
        isLoading={isLoading}
        error={error}
        loadMore={!isReachingEnd && loadMore}
        getCredit={(image) => (
          <span>
            Video by{' '}
            <a href={image.user.url} target="_blank">
              {image.user.name}
            </a>{' '}
            on{' '}
            <a
              href="https://pexels.com/?utm_source=polotno&utm_medium=referral"
              target="_blank"
            >
              Pexels
            </a>
          </span>
        )}
      />
    </div>
  );
};

// define the new custom section
export const VideosSection = {
  name: 'videos',
  Tab: (props) => (
    <SectionTab name="Videos" {...props}>
      <Video />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: VideosPanel,
};
