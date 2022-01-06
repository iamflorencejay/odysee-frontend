import { connect } from 'react-redux';
import { doCommentList, doSuperChatList } from 'redux/actions/comments';
import { doResolveUris } from 'redux/actions/claims';
import { MAX_LIVESTREAM_COMMENTS } from 'constants/livestream';
import { selectClaimForUri } from 'redux/selectors/claims';
import {
  selectTopLevelCommentsForUri,
  selectSuperChatsForUri,
  selectSuperChatTotalAmountForUri,
  selectPinnedCommentsForUri,
} from 'redux/selectors/comments';
import LivestreamChatLayout from './view';

const select = (state, props) => {
  const { uri } = props;

  return {
    claim: selectClaimForUri(state, uri),
    comments: selectTopLevelCommentsForUri(state, uri, MAX_LIVESTREAM_COMMENTS),
    pinnedComments: selectPinnedCommentsForUri(state, uri),
    superChats: selectSuperChatsForUri(state, uri),
    superChatsTotalAmount: selectSuperChatTotalAmountForUri(state, uri),
  };
};

const perform = (dispatch, ownProps) => {
  const { uri } = ownProps;

  return {
    resolveUris: (uris) => dispatch(doResolveUris(uris, true)),
    listComments: () => dispatch(doCommentList(uri, '', 1, 75)),
    listSuperChats: () => dispatch(doSuperChatList(uri)),
  };
};

export default connect(select, perform)(LivestreamChatLayout);
