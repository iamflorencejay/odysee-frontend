// @flow
import { v4 as uuid } from 'uuid';
import { makeV4UploadRequest } from './publish-v4';

// A modified version of Lbry.apiCall that allows
// to perform calling methods at arbitrary urls
// and pass form file fields
export default function apiPublishCallViaWeb(
  apiCall: (any, any, any, any) => any,
  token: string,
  method: string,
  params: FileUploadSdkParams,
  resolve: Function,
  reject: Function
) {
  const { file_path: filePath, preview, remote_url: remoteUrl, publishId } = params;

  if (!filePath && !remoteUrl && !publishId) {
    const { claim_id, ...otherParams } = params;
    return apiCall(method, otherParams, resolve, reject);
  }

  let fileField = filePath;

  if (preview) {
    // Send dummy file for the preview. The tx-fee calculation does not depend on it.
    const dummyContent = 'x';
    fileField = new File([dummyContent], 'dummy.md', { type: 'text/markdown' });
  }

  // Add a random ID to serve as the redux key.
  // If it already exists, then it is a resumed session.
  if (!params.guid) {
    params.guid = uuid();
  }

  return makeV4UploadRequest(token, params, fileField)
    .then((result) => resolve(result))
    .catch((err) => {
      assert(false, `${err.message}`, err.cause || err);
      reject(err);
    });
}
