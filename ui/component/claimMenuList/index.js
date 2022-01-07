import { connect } from 'react-redux';
import { selectClaimForUri, selectClaimIsMine } from 'redux/selectors/claims';
import { doCollectionEdit } from 'redux/actions/collections';
import { doPrepareEdit } from 'redux/actions/publish';
import { makeSelectCollectionForIdHasClaimUrl, makeSelectCollectionIsMine } from 'redux/selectors/collections';
import { makeSelectFileInfoForUri } from 'redux/selectors/file_info';
import * as COLLECTIONS_CONSTS from 'constants/collections';
import { makeSelectChannelIsMuted } from 'redux/selectors/blocked';
import { doChannelMute, doChannelUnmute } from 'redux/actions/blocked';
import { doSetActiveChannel, doSetIncognito, doOpenModal } from 'redux/actions/app';
import {
  doCommentModBlock,
  doCommentModUnBlock,
  doCommentModBlockAsAdmin,
  doCommentModUnBlockAsAdmin,
} from 'redux/actions/comments';
import {
  selectHasAdminChannel,
  makeSelectChannelIsBlocked,
  makeSelectChannelIsAdminBlocked,
} from 'redux/selectors/comments';
import { doToast } from 'redux/actions/notifications';
import { doChannelSubscribe, doChannelUnsubscribe } from 'redux/actions/subscriptions';
import { selectIsSubscribedForUri } from 'redux/selectors/subscriptions';
import { selectUserVerifiedEmail } from 'redux/selectors/user';
import { selectListShuffle } from 'redux/selectors/content';
import { getChannelPermanentUrlFromClaim } from 'util/claim';
import ClaimPreview from './view';
import fs from 'fs';

const select = (state, props) => {
  const { uri } = props;

  const shuffleList = selectListShuffle(state);
  const claim = selectClaimForUri(state, uri, false);
  const repostedClaim = claim && claim.reposted_claim;
  const contentClaim = repostedClaim || claim;

  const permanentUrl = contentClaim && contentClaim.permanent_url;
  const channelUri = getChannelPermanentUrlFromClaim(contentClaim);

  const isCollectionClaim = claim && claim.value_type === 'collection';
  const collectionClaimId = isCollectionClaim && claim && claim.claim_id;

  return {
    channelIsAdminBlocked: makeSelectChannelIsAdminBlocked(uri)(state),
    channelIsBlocked: makeSelectChannelIsBlocked(channelUri)(state),
    channelIsMuted: makeSelectChannelIsMuted(channelUri)(state),
    channelUri,
    claim,
    claimIsMine: selectClaimIsMine(state, claim),
    collectionClaimId,
    contentClaim,
    fileInfo: makeSelectFileInfoForUri(permanentUrl)(state),
    hasClaimInFavorites: makeSelectCollectionForIdHasClaimUrl(COLLECTIONS_CONSTS.FAVORITES_ID, permanentUrl)(state),
    hasClaimInWatchLater: makeSelectCollectionForIdHasClaimUrl(COLLECTIONS_CONSTS.WATCH_LATER_ID, permanentUrl)(state),
    isAdmin: selectHasAdminChannel(state),
    isAuthenticated: Boolean(selectUserVerifiedEmail(state)),
    isMyCollection: makeSelectCollectionIsMine(collectionClaimId)(state),
    isSubscribed: selectIsSubscribedForUri(state, channelUri),
    shuffleList,
  };
};

const perform = (dispatch) => ({
  prepareEdit: (publishData, uri, fileInfo) => {
    if (publishData.signing_channel) {
      dispatch(doSetIncognito(false));
      dispatch(doSetActiveChannel(publishData.signing_channel.claim_id));
    } else {
      dispatch(doSetIncognito(true));
    }

    dispatch(doPrepareEdit(publishData, uri, fileInfo, fs));
  },
  copyToClipboard: (textToCopy, successMsg, failureMsg) =>
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        dispatch(doToast({ message: __(successMsg) }));
      })
      .catch(() => {
        dispatch(doToast({ message: __(failureMsg), isError: true }));
      }),
  openModal: (modal, props) => dispatch(doOpenModal(modal, props)),
  handleMute: (muted, channelUri) => dispatch(muted ? doChannelUnmute(channelUri) : doChannelMute(channelUri)),
  handleBlock: (blocked, channelUri) =>
    dispatch(blocked ? doCommentModUnBlock(channelUri) : doCommentModBlock(channelUri)),
  handleAdminBlock: (blocked, channelUri) =>
    dispatch(
      blocked ? doCommentModUnBlockAsAdmin(channelUri, '') : doCommentModBlockAsAdmin(channelUri, undefined, undefined)
    ),
  handleSubscribe: (subscribed, subscription) =>
    dispatch(subscribed ? doChannelUnsubscribe(subscription) : doChannelSubscribe(subscription)),
  editCollection: (listName, listId, isInList, claim) => {
    dispatch(doCollectionEdit(listId, { claims: [claim], remove: isInList, type: 'playlist' }));
    dispatch(
      doToast({
        message: isInList
          ? __('Item removed from %listName%', { listName })
          : __('Item added to %listName%', { listName }),
      })
    );
  },
});

export default connect(select, perform)(ClaimPreview);
