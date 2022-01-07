// @flow
import { URL, SHARE_DOMAIN_URL } from 'config';
import * as ICONS from 'constants/icons';
import * as PAGES from 'constants/pages';
import * as MODALS from 'constants/modal_types';
import * as COLLECTIONS_CONSTS from 'constants/collections';
import React from 'react';
import classnames from 'classnames';
import { Menu, MenuButton, MenuList } from '@reach/menu-button';
import MenuLinkButton from 'component/common/menu-link';
import MenuItemButton from 'component/common/menu-item';
import Icon from 'component/common/icon';
import {
  generateShareUrl,
  generateRssUrl,
  generateLbryContentUrl,
  formatLbryUrlForWeb,
  generateListSearchUrlParams,
} from 'util/url';
import { useHistory } from 'react-router';
import { buildURI, parseURI } from 'util/lbryURI';

const SHARE_DOMAIN = SHARE_DOMAIN_URL || URL;
const PAGE_VIEW_QUERY = 'view';
const EDIT_PAGE = 'edit';

type SubscriptionArgs = {
  channelName: string,
  uri: string,
  notificationsDisabled?: boolean,
};

type Props = {
  uri: string,
  claim: ?Claim,
  repostedClaim: ?Claim,
  contentClaim: ?Claim,
  contentSigningChannel: ?Claim,
  contentChannelUri: string,
  openModal: (id: string, {}) => void,
  inline?: boolean,
  channelIsMuted: boolean,
  channelIsBlocked: boolean,
  channelIsAdminBlocked: boolean,
  isAdmin: boolean,
  handleMute: (boolean, string) => void,
  handleModBlock: (boolean, string) => void,
  handleAdminBlock: (boolean, string) => void,
  doCollectionEdit: (string, any) => void,
  hasClaimInWatchLater: boolean,
  hasClaimInFavorites: boolean,
  claimInCollection: boolean,
  collectionId: string,
  isMyCollection: boolean,
  doToast: ({ message: string, isError?: boolean }) => void,
  claimIsMine: boolean,
  fileInfo: FileListItem,
  prepareEdit: ({}, string, {}) => void,
  isSubscribed: boolean,
  handleSubscribe: (boolean, SubscriptionArgs) => void,
  isChannelPage: boolean,
  editedCollection: Collection,
  isAuthenticated: boolean,
  playNextUri: string,
  resolvedList: boolean,
  fetchCollectionItems: (string) => void,
  doToggleShuffleList: (string) => void,
};

function ClaimMenuList(props: Props) {
  const {
    uri,
    claim,
    repostedClaim,
    contentClaim,
    contentSigningChannel,
    contentChannelUri,
    openModal,
    inline = false,
    handleMute,
    channelIsMuted,
    channelIsBlocked,
    channelIsAdminBlocked,
    isAdmin,
    handleModBlock,
    handleAdminBlock,
    doCollectionEdit,
    hasClaimInWatchLater,
    hasClaimInFavorites,
    collectionId,
    isMyCollection,
    doToast,
    claimIsMine,
    fileInfo,
    prepareEdit,
    isSubscribed,
    handleSubscribe,
    isChannelPage = false,
    editedCollection,
    isAuthenticated,
    playNextUri,
    resolvedList,
    fetchCollectionItems,
    doToggleShuffleList,
  } = props;
  const [doShuffle, setDoShuffle] = React.useState(false);
  const incognitoClaim = contentChannelUri && !contentChannelUri.includes('@');
  const isChannel = !incognitoClaim && !contentSigningChannel;
  const { channelName } = parseURI(contentChannelUri);
  const showDelete = claimIsMine || (fileInfo && (fileInfo.written_bytes > 0 || fileInfo.blobs_completed > 0));
  const subscriptionLabel = repostedClaim
    ? isSubscribed
      ? __('Unfollow @%channelName%', { channelName })
      : __('Follow @%channelName%', { channelName })
    : isSubscribed
    ? __('Unfollow')
    : __('Follow');

  const { push, replace } = useHistory();

  const fetchItems = React.useCallback(() => {
    if (collectionId) {
      fetchCollectionItems(collectionId);
    }
  }, [collectionId, fetchCollectionItems]);

  React.useEffect(() => {
    if (doShuffle && resolvedList) {
      doToggleShuffleList(collectionId);
      if (playNextUri) {
        const navigateUrl = formatLbryUrlForWeb(playNextUri);
        push({
          pathname: navigateUrl,
          search: generateListSearchUrlParams(collectionId),
          state: { collectionId, forceAutoplay: true },
        });
      }
    }
  }, [collectionId, doShuffle, doToggleShuffleList, playNextUri, push, resolvedList]);

  if (!claim) {
    return null;
  }

  const lbryUrl: string = generateLbryContentUrl(claim.canonical_url, claim.permanent_url);
  const shareUrl: string = generateShareUrl(SHARE_DOMAIN, lbryUrl);
  const rssUrl: string = isChannel ? generateRssUrl(SHARE_DOMAIN, claim) : '';
  const isCollectionClaim = claim && claim.value_type === 'collection';
  // $FlowFixMe
  const isPlayable =
    contentClaim &&
    // $FlowFixMe
    contentClaim.value &&
    // $FlowFixMe
    contentClaim.value.stream_type &&
    // $FlowFixMe
    (contentClaim.value.stream_type === 'audio' || contentClaim.value.stream_type === 'video');

  function handleAdd(source, name, collectionId) {
    doCollectionEdit(collectionId, {
      claims: [contentClaim],
      remove: source,
      type: 'playlist',
    });

    doToast({
      message: source ? __('Item removed from %name%', { name }) : __('Item added to %name%', { name }),
    });
  }

  function copyToClipboard(textToCopy, successMsg, failureMsg) {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        doToast({ message: __(successMsg) });
      })
      .catch(() => {
        doToast({ message: __(failureMsg), isError: true });
      });
  }

  return (
    <Menu>
      <MenuButton
        className={classnames('menu__button', { 'claim__menu-button': !inline, 'claim__menu-button--inline': inline })}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <Icon size={20} icon={ICONS.MORE_VERTICAL} />
      </MenuButton>

      <MenuList className="menu__list">
        <>
          {/* COLLECTION OPERATIONS */}
          {collectionId && isCollectionClaim ? (
            <>
              <MenuLinkButton page={`${PAGES.LIST}/${collectionId}`} icon={ICONS.VIEW} label={__('View List')} />

              <MenuItemButton
                onSelect={() => {
                  if (!resolvedList) fetchItems();
                  setDoShuffle(true);
                }}
                icon={ICONS.SHUFFLE}
                label={__('Shuffle Play')}
              />

              {isMyCollection && (
                <>
                  <MenuLinkButton
                    page={`${PAGES.LIST}/${collectionId}?view=edit`}
                    icon={ICONS.PUBLISH}
                    label={editedCollection ? __('Publish') : __('Edit List')}
                  />

                  <MenuItemButton
                    onSelect={() => openModal(MODALS.COLLECTION_DELETE, { collectionId })}
                    icon={ICONS.DELETE}
                    label={__('Delete List')}
                  />
                </>
              )}
            </>
          ) : (
            isAuthenticated &&
            isPlayable && (
              <>
                {/* WATCH LATER */}
                <MenuItemButton
                  onSelect={() => handleAdd(hasClaimInWatchLater, __('Watch Later'), COLLECTIONS_CONSTS.WATCH_LATER_ID)}
                  icon={hasClaimInWatchLater ? ICONS.DELETE : ICONS.TIME}
                  label={hasClaimInWatchLater ? __('In Watch Later') : __('Watch Later')}
                />

                {/* FAVORITES LIST */}
                <MenuItemButton
                  onSelect={() => handleAdd(hasClaimInFavorites, __('Favorites'), COLLECTIONS_CONSTS.FAVORITES_ID)}
                  icon={hasClaimInFavorites ? ICONS.DELETE : ICONS.STAR}
                  label={hasClaimInFavorites ? __('In Favorites') : __('Favorites')}
                />

                {/* CURRENTLY ONLY SUPPORT PLAYLISTS FOR PLAYABLE; LATER DIFFERENT TYPES */}
                <MenuItemButton
                  onSelect={() => openModal(MODALS.COLLECTION_ADD, { uri, type: 'playlist' })}
                  icon={ICONS.STACK}
                  label={__('Add to Lists')}
                />

                <hr className="menu__separator" />
              </>
            )
          )}
        </>

        {isAuthenticated && (
          <>
            {!isChannelPage && (
              <MenuItemButton
                onSelect={() => openModal(MODALS.SEND_TIP, { uri, isSupport: true })}
                icon={ICONS.LBC}
                label={__('Support --[button to support a claim]--')}
              />
            )}

            {!incognitoClaim && !claimIsMine && !isChannelPage && (
              <>
                <hr className="menu__separator" />

                <MenuItemButton
                  onSelect={() =>
                    channelName &&
                    handleSubscribe(isSubscribed, {
                      channelName: '@' + channelName,
                      uri: contentChannelUri,
                      notificationsDisabled: true,
                    })
                  }
                  icon={ICONS.SUBSCRIBE}
                  label={subscriptionLabel}
                />
              </>
            )}

            {!isMyCollection && (
              <>
                {(!claimIsMine || channelIsBlocked) && contentChannelUri ? (
                  !incognitoClaim && (
                    <>
                      {!isChannelPage && <hr className="menu__separator" />}

                      <MenuItemButton
                        onSelect={() => handleModBlock(channelIsBlocked, contentChannelUri)}
                        icon={ICONS.BLOCK}
                        label={channelIsBlocked ? __('Unblock Channel') : __('Block Channel')}
                      />

                      {isAdmin && (
                        <MenuItemButton
                          onSelect={() => handleAdminBlock(true, contentChannelUri)}
                          icon={ICONS.GLOBE}
                          label={channelIsAdminBlocked ? __('Global Unblock Channel') : __('Global Block Channel')}
                        />
                      )}

                      <MenuItemButton
                        onSelect={() => handleMute(channelIsMuted, contentChannelUri)}
                        icon={ICONS.MUTE}
                        label={channelIsMuted ? __('Unmute Channel') : __('Mute Channel')}
                      />
                    </>
                  )
                ) : (
                  <>
                    {!isChannelPage && !repostedClaim && (
                      <MenuItemButton
                        onSelect={() => {
                          if (!isChannel) {
                            const signingChannelName = contentSigningChannel && contentSigningChannel.name;

                            const uriObject: LbryUrlObj = { streamName: claim.name, streamClaimId: claim.claim_id };

                            if (signingChannelName) uriObject.channelName = signingChannelName;

                            const editUri = buildURI(uriObject);
                            push(`/$/${PAGES.UPLOAD}`);
                            prepareEdit(claim, editUri, fileInfo);
                          } else {
                            const channelUrl = claim.name + ':' + claim.claim_id;
                            push(`/${channelUrl}?${PAGE_VIEW_QUERY}=${EDIT_PAGE}`);
                          }
                        }}
                        icon={ICONS.EDIT}
                        label={__('Edit')}
                      />
                    )}
                  </>
                )}

                {showDelete && (
                  <MenuItemButton
                    onSelect={() =>
                      !repostedClaim && !isChannel
                        ? openModal(MODALS.CONFIRM_FILE_REMOVE, { uri, doGoBack: false })
                        : openModal(MODALS.CONFIRM_CLAIM_REVOKE, {
                            claim,
                            cb: isChannel && (() => replace(`/$/${PAGES.CHANNELS}`)),
                          })
                    }
                    icon={ICONS.DELETE}
                    label={__('Delete')}
                  />
                )}
              </>
            )}
            <hr className="menu__separator" />
          </>
        )}

        <MenuItemButton
          onSelect={() => copyToClipboard(shareUrl, 'Link copied.', 'Failed to copy link.')}
          icon={ICONS.COPY_LINK}
          label={__('Copy Link')}
        />

        {isChannelPage && IS_WEB && rssUrl && (
          <MenuItemButton
            onSelect={() => copyToClipboard(rssUrl, 'RSS URL copied.', 'Failed to copy RSS URL.')}
            icon={ICONS.RSS}
            label={__('Copy RSS URL')}
          />
        )}

        {!claimIsMine && !isMyCollection && contentClaim && (
          <MenuLinkButton
            page={`${PAGES.REPORT_CONTENT}?claimId=${contentClaim.claim_id}`}
            icon={ICONS.REPORT}
            label={__('Report Content')}
          />
        )}
      </MenuList>
    </Menu>
  );
}

export default ClaimMenuList;
