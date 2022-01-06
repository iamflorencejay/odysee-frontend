import { connect } from 'react-redux';
import { DISABLE_COMMENTS_TAG } from 'constants/tags';
import { doCommentSocketConnect, doCommentSocketDisconnect } from 'redux/actions/websocket';
import { doFetchChannelLiveStatus } from 'redux/actions/livestream';
import { doSetPlayingUri } from 'redux/actions/content';
import { doUserSetReferrer } from 'redux/actions/user';
import { getChannelIdFromClaim } from 'util/claim';
import { makeSelectTagInClaimOrChannelForUri, selectClaimForUri } from 'redux/selectors/claims';
import { selectActiveLivestreamForChannel, selectActiveLivestreamInitialized } from 'redux/selectors/livestream';
import { selectUserVerifiedEmail } from 'redux/selectors/user';
import LivestreamPage from './view';

const select = (state, props) => {
  const channelClaimId = getChannelIdFromClaim(selectClaimForUri(state, props.uri));

  return {
    activeLivestreamForChannel: selectActiveLivestreamForChannel(state, channelClaimId),
    activeLivestreamInitialized: selectActiveLivestreamInitialized(state),
    channelClaimId,
    chatDisabled: makeSelectTagInClaimOrChannelForUri(props.uri, DISABLE_COMMENTS_TAG)(state),
    isAuthenticated: selectUserVerifiedEmail(state),
  };
};

const perform = (dispatch, ownProps) => {
  const { uri } = ownProps;

  return {
    clearPlayingUri: () => dispatch(doSetPlayingUri({ uri: null })),
    doCommentSocketConnect: (claimId) => dispatch(doCommentSocketConnect(uri, claimId)),
    doCommentSocketDisconnect: (claimId) => dispatch(doCommentSocketDisconnect(claimId)),
    doFetchChannelLiveStatus: (claimId) => dispatch(doFetchChannelLiveStatus(claimId)),
    setReferrer: () => dispatch(doUserSetReferrer(uri.replace('lbry://', ''))),
  };
};

export default connect(select, perform)(LivestreamPage);
