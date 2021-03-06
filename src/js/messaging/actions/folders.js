import {
  apiRequest,
  createUrlWithQuery
} from '../utils/helpers';

import {
  CREATE_FOLDER_SUCCESS,
  CREATE_FOLDER_FAILURE,
  DELETE_FOLDER_SUCCESS,
  DELETE_FOLDER_FAILURE,
  FETCH_FOLDERS_SUCCESS,
  FETCH_FOLDERS_FAILURE,
  FETCH_FOLDER_SUCCESS,
  FETCH_FOLDER_FAILURE,
  TOGGLE_FOLDER_NAV,
  TOGGLE_MANAGED_FOLDERS,
  SET_CURRENT_FOLDER
} from '../utils/constants';

const baseUrl = '/folders';

export function fetchFolders() {
  // Get the max number of folders.
  const query = {};
  const perPage = 'per_page';
  query[perPage] = 100;
  const url = createUrlWithQuery(baseUrl, query);

  return dispatch => {
    apiRequest(
      url,
      null,
      data => dispatch({ type: FETCH_FOLDERS_SUCCESS, data }),
      () => dispatch({ type: FETCH_FOLDERS_FAILURE })
    );
  };
}

export function fetchFolder(id, query = {}) {
  const folderUrl = `${baseUrl}/${id}`;
  const messagesUrl = createUrlWithQuery(`${folderUrl}/messages`, query);

  return dispatch => {
    Promise.all([folderUrl, messagesUrl].map(url =>
      apiRequest(
        url,
        null,
        response => response,
        () => dispatch({ type: FETCH_FOLDER_FAILURE })
      )
    )).then(
      data => dispatch({
        type: FETCH_FOLDER_SUCCESS,
        folder: data[0],
        messages: data[1]
      })
    );
  };
}

// Slides the folder nav out on mobile.
export function toggleFolderNav() {
  return { type: TOGGLE_FOLDER_NAV };
}

// Expands the list of named folders.
export function toggleManagedFolders() {
  return { type: TOGGLE_MANAGED_FOLDERS };
}

export function createNewFolder(folderName) {
  const folderData = { folder: {} };
  folderData.folder.name = folderName;

  const settings = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(folderData)
  };

  return dispatch => {
    apiRequest(
      baseUrl,
      settings,
      data => dispatch({
        type: CREATE_FOLDER_SUCCESS,
        folder: data.data.attributes
      }),
      () => dispatch({ type: CREATE_FOLDER_FAILURE })
    );
  };
}

export function deleteFolder(folder) {
  const url = `${baseUrl}/${folder.folderId}`;
  return dispatch => {
    apiRequest(
      url,
      { method: 'DELETE' },
      () => dispatch({ type: DELETE_FOLDER_SUCCESS, folder }),
      () => dispatch({ type: DELETE_FOLDER_FAILURE })
    );
  };
}

// Persists folder ID across threads
export function setCurrentFolder(folderId) {
  return {
    type: SET_CURRENT_FOLDER,
    folderId
  };
}
