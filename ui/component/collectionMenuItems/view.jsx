// @flow
import { formatLbryUrlForWeb, generateListSearchUrlParams } from 'util/url';
import { useHistory } from 'react-router';
import * as ICONS from 'constants/icons';
import * as PAGES from 'constants/pages';
import MenuItemButton from 'component/common/menu-item';
import MenuLinkButton from 'component/common/menu-link';
import React from 'react';

type Props = {
  collectionId: string,
  editedCollection: Collection,
  inline?: boolean,
  playNextUri: string,
  doToggleShuffleList: (string) => void,
  openDeleteModal: (string) => void,
};

export default function CollectionMenuItems(props: Props) {
  const { collectionId, editedCollection, playNextUri, doToggleShuffleList, openDeleteModal } = props;

  const { push } = useHistory();
  const [doShuffle, setDoShuffle] = React.useState(false);

  React.useEffect(() => {
    if (playNextUri && doShuffle) {
      setDoShuffle(false);
      const navigateUrl = formatLbryUrlForWeb(playNextUri);
      push({
        pathname: navigateUrl,
        search: generateListSearchUrlParams(collectionId),
        state: { forceAutoplay: true },
      });
    }
  }, [collectionId, doShuffle, playNextUri, push]);

  return (
    collectionId && (
      <>
        <MenuLinkButton page={`${PAGES.LIST}/${collectionId}`} icon={ICONS.VIEW} label={__('View List')} />

        <MenuItemButton
          onSelect={() => {
            doToggleShuffleList(collectionId);
            setDoShuffle(true);
          }}
          icon={ICONS.SHUFFLE}
          label={__('Shuffle Play')}
        />

        <MenuLinkButton
          page={`${PAGES.LIST}/${collectionId}?view=edit`}
          icon={ICONS.PUBLISH}
          label={editedCollection ? __('Publish') : __('Edit List')}
        />

        <MenuItemButton onSelect={() => openDeleteModal(collectionId)} icon={ICONS.DELETE} label={__('Delete List')} />
      </>
    )
  );
}
