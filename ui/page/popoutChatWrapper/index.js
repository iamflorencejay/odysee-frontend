import { buildURI } from 'util/lbryURI';
import { connect } from 'react-redux';
import { doCommentSocketConnect, doCommentSocketDisconnect } from 'redux/actions/websocket';
import { doFetchActiveLivestream } from 'redux/actions/livestream';
import { doResolveUri } from 'redux/actions/claims';
import { getChannelIdFromClaim } from 'util/claim';
import { selectIsStreamPlaceholderForUri, selectClaimForUri } from 'redux/selectors/claims';
import PopoutChatPage from './view';

const select = (state, props) => {
  const { match } = props;
  const { params } = match;
  const { channelName, streamName } = params;

  const uri = buildURI({ channelName: channelName.replace(':', '#'), streamName: streamName.replace(':', '#') }) || '';
  const claim = selectClaimForUri(state, uri);
  const channelClaimId = getChannelIdFromClaim(claim);

  return {
    channelClaimId,
    claim,
    isLivestream: selectIsStreamPlaceholderForUri(state, uri),
    uri,
  };
};

const perform = (dispatch, ownProps) => ({
  // clearPlayingUri: () => dispatch(doSetPlayingUri({ uri: null })),
  doCommentSocketConnect: (uri, claimId) => dispatch(doCommentSocketConnect(uri, claimId)),
  doCommentSocketDisconnect: (claimId) => dispatch(doCommentSocketDisconnect(claimId)),
  doFetchActiveLivestream: (claimId) => dispatch(doFetchActiveLivestream(claimId)),
  // setReferrer: () => dispatch(doUserSetReferrer(uri.replace('lbry://', ''))),
  doResolveUri: (uri) => dispatch(doResolveUri(uri, true)),
});

export default connect(select, perform)(PopoutChatPage);
