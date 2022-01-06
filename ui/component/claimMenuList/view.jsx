// @flow
import { buildURI, parseURI } from 'util/lbryURI';
import { generateShareUrl, generateRssUrl, formatLbryUrlForWeb, generateListSearchUrlParams } from 'util/url';
import { Menu, MenuButton, MenuList } from '@reach/menu-button';
import { URL, SHARE_DOMAIN_URL } from 'config';
import { useHistory } from 'react-router';
import * as COLLECTIONS_CONSTS from 'constants/collections';
import * as ICONS from 'constants/icons';
import * as MODALS from 'constants/modal_types';
import * as PAGES from 'constants/pages';
import classnames from 'classnames';
import Icon from 'component/common/icon';
import MenuItemButton from 'component/common/menu-item';
import MenuLinkButton from 'component/common/menu-link';
import React from 'react';

const SHARE_DOMAIN = SHARE_DOMAIN_URL || URL;
const PAGE_VIEW_QUERY = 'view';
const EDIT_PAGE = 'edit';

type Props = {
  channelIsAdminBlocked: boolean,
  channelIsBlocked: boolean,
  channelIsMuted: boolean,
  channelUri: string,
  claim: ?Claim,
  claimIsMine: boolean,
  collectionClaimId: string,
  contentClaim: ?Claim,
  contentSigningChannel: ?Claim,
  editedCollection: Collection,
  hasClaimInFavorites: boolean,
  hasClaimInWatchLater: boolean,
  inline?: boolean,
  isAdmin: boolean,
  isAuthenticated: boolean,
  isChannelPage: boolean,
  isMyCollection: boolean,
  isSubscribed: boolean,
  resolvedList: boolean,
  shuffleList?: any,
  uri: string,
  copyToClipboard: (string, string, string) => void,
  doToggleShuffleList: (string) => void,
  editCollection: (string, string, boolean, ?Claim) => void,
  fetchCollectionItems: (string) => void,
  handleAdminBlock: (boolean, string) => void,
  handleBlock: (boolean, string) => void,
  handleMute: (boolean, string) => void,
  handleSubscribe: (boolean, SubscriptionArgs) => void,
  openModal: (id: string, {}) => void,
  prepareEdit: ({}, string) => void,
};

export default function ClaimMenuList(props: Props) {
  const {
    channelIsAdminBlocked,
    channelIsBlocked,
    channelIsMuted,
    channelUri,
    claim,
    claimIsMine,
    collectionClaimId,
    contentClaim,
    contentSigningChannel,
    editedCollection,
    hasClaimInFavorites,
    hasClaimInWatchLater,
    inline = false,
    isAdmin,
    isAuthenticated,
    isChannelPage = false,
    isMyCollection,
    isSubscribed,
    resolvedList,
    shuffleList,
    uri,
    copyToClipboard,
    doToggleShuffleList,
    editCollection,
    fetchCollectionItems,
    handleAdminBlock,
    handleBlock,
    handleMute,
    handleSubscribe,
    openModal,
    prepareEdit,
  } = props;

  const { push, replace } = useHistory();
  const [doShuffle, setDoShuffle] = React.useState(false);

  const shuffle = shuffleList && shuffleList.collectionId === collectionClaimId && shuffleList.newUrls;
  const playNextUri = shuffle && shuffle[0];

  const isRepost = Boolean(claim && claim.reposted_claim);
  const isCollection = Boolean(collectionClaimId);
  const incognitoClaim = !channelUri;
  const isChannel = claim && claim.value_type === 'channel';
  const { channelName } = parseURI(channelUri) || '';

  const shareUrl = generateShareUrl(SHARE_DOMAIN, uri);
  const rssUrl = isChannel && generateRssUrl(SHARE_DOMAIN, claim);

  const isPlayable =
    contentClaim &&
    contentClaim.value &&
    // $FlowFixMe
    contentClaim.value.stream_type &&
    (contentClaim.value.stream_type === 'audio' || contentClaim.value.stream_type === 'video');

  React.useEffect(() => {
    if (doShuffle && resolvedList) {
      doToggleShuffleList(collectionClaimId);

      if (playNextUri) {
        push({
          pathname: formatLbryUrlForWeb(playNextUri),
          search: generateListSearchUrlParams(collectionClaimId),
          state: { collectionClaimId, forceAutoplay: true },
        });
      }
    }
  }, [collectionClaimId, doShuffle, doToggleShuffleList, playNextUri, push, resolvedList]);

  if (!claim) return null;

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
        {/* COLLECTION OPERATIONS */}
        {isCollection ? (
          <>
            <MenuLinkButton page={`${PAGES.LIST}/${collectionClaimId}`} icon={ICONS.VIEW} label={__('View List')} />

            <MenuItemButton
              onSelect={() => {
                if (!resolvedList && collectionClaimId) fetchCollectionItems(collectionClaimId);
                setDoShuffle(true);
              }}
              icon={ICONS.SHUFFLE}
              label={__('Shuffle Play')}
            />

            {isMyCollection && (
              <>
                <MenuLinkButton
                  page={`${PAGES.LIST}/${collectionClaimId}?view=edit`}
                  icon={ICONS.PUBLISH}
                  label={editedCollection ? __('Publish') : __('Edit List')}
                />

                <MenuItemButton
                  onSelect={() => openModal(MODALS.COLLECTION_DELETE, { collectionClaimId })}
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
              {/* ADD TO WATCH LATER */}
              <MenuItemButton
                onSelect={() =>
                  editCollection(
                    __('Watch Later'),
                    COLLECTIONS_CONSTS.WATCH_LATER_ID,
                    hasClaimInWatchLater,
                    contentClaim
                  )
                }
                icon={hasClaimInWatchLater ? ICONS.DELETE : ICONS.TIME}
                label={hasClaimInWatchLater ? __('In Watch Later') : __('Watch Later')}
              />

              {/* ADD TO FAVORITES */}
              <MenuItemButton
                onSelect={() =>
                  editCollection(__('Favorites'), COLLECTIONS_CONSTS.FAVORITES_ID, hasClaimInFavorites, contentClaim)
                }
                icon={hasClaimInFavorites ? ICONS.DELETE : ICONS.STAR}
                label={hasClaimInFavorites ? __('In Favorites') : __('Favorites')}
              />

              {/* CURRENTLY ONLY SUPPORT PLAYLISTS FOR PLAYABLE; LATER DIFFERENT TYPES */}
              <MenuItemButton
                onSelect={() => openModal(MODALS.COLLECTION_ADD, { uri, type: 'playlist' })}
                icon={ICONS.STACK}
                label={__('Add to Lists')}
              />
            </>
          )
        )}

        {isAuthenticated && (
          <>
            {!isChannelPage && (
              <>
                <hr className="menu__separator" />

                <MenuItemButton
                  onSelect={() => openModal(MODALS.SEND_TIP, { uri, isSupport: true })}
                  icon={ICONS.LBC}
                  label={__('Support --[button to support a claim]--')}
                />

                {!incognitoClaim && !claimIsMine && (
                  <MenuItemButton
                    onSelect={() =>
                      channelName &&
                      handleSubscribe(isSubscribed, {
                        channelName: '@' + channelName,
                        uri: channelUri,
                        notificationsDisabled: true,
                      })
                    }
                    icon={ICONS.SUBSCRIBE}
                    label={
                      isSubscribed
                        ? __('Unfollow @%channelName%', { channelName })
                        : __('Follow @%channelName%', { channelName })
                    }
                  />
                )}
              </>
            )}

            {(!claimIsMine || channelIsBlocked) && !incognitoClaim ? (
              <>
                {!isChannelPage && <hr className="menu__separator" />}

                <MenuItemButton
                  onSelect={() => handleBlock(channelIsBlocked, channelUri)}
                  icon={ICONS.BLOCK}
                  label={
                    channelIsBlocked
                      ? __('Unblock @%channelName%', { channelName })
                      : __('Block @%channelName%', { channelName })
                  }
                />

                {isAdmin && (
                  <MenuItemButton
                    onSelect={() => handleAdminBlock(channelIsAdminBlocked, channelUri)}
                    icon={ICONS.GLOBE}
                    label={
                      channelIsAdminBlocked
                        ? __('Global Unblock @%channelName%', { channelName })
                        : __('Global Block @%channelName%', { channelName })
                    }
                  />
                )}

                <MenuItemButton
                  onSelect={() => handleMute(channelIsMuted, channelUri)}
                  icon={ICONS.MUTE}
                  label={
                    channelIsMuted
                      ? __('Unmute @%channelName%', { channelName })
                      : __('Mute @%channelName%', { channelName })
                  }
                />
              </>
            ) : (
              !isChannelPage &&
              !isRepost && (
                <MenuItemButton
                  onSelect={() => {
                    if (!isChannel) {
                      const signingChannelName = contentSigningChannel && contentSigningChannel.name;

                      const uriObject: LbryUrlObj = { streamName: claim.name, streamClaimId: claim.claim_id };

                      if (signingChannelName) uriObject.channelName = signingChannelName;

                      const editUri = buildURI(uriObject);
                      push(`/$/${PAGES.UPLOAD}`);
                      prepareEdit(claim, editUri);
                    } else {
                      const channelUrl = claim.name + ':' + claim.claim_id;
                      push(`/${channelUrl}?${PAGE_VIEW_QUERY}=${EDIT_PAGE}`);
                    }
                  }}
                  icon={ICONS.EDIT}
                  label={__('Edit')}
                />
              )
            )}

            {claimIsMine && (
              <MenuItemButton
                onSelect={() =>
                  !isRepost && !isChannel
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
