import React from 'react';
import ReactDOM from 'react-dom';
import { Button, List } from 'antd';
import 'antd/dist/antd.css';
import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Provider, useDispatch, useSelector } from 'react-redux';

const captureScreenshot = createAsyncThunk('screenshot/capture', async (_, thunkAPI) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, async (dataUrl) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      // Example axios call (dummy endpoint)
      try {
        await axios.post('https://example.com/upload', { screenshot: dataUrl });
      } catch (error) {
        // Handle error if needed
      }
      resolve(dataUrl);
    });
  });
});

const screenshotSlice = createSlice({
  name: 'screenshot',
  initialState: { screenshots: [] },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(captureScreenshot.fulfilled, (state, action) => {
      state.screenshots.push(action.payload);
    });
  },
});

const store = configureStore({
  reducer: { screenshot: screenshotSlice.reducer },
});

const App = () => {
  const dispatch = useDispatch();
  const screenshots = useSelector((state) => state.screenshot.screenshots);
  return (
    <div style={{ padding: '20px' }}>
      <Button type="primary" onClick={() => dispatch(captureScreenshot())}>
        Capture Screenshot
      </Button>
      <List
        header={<div>Captured Screenshots</div>}
        bordered
        dataSource={screenshots}
        renderItem={(item, index) => (
          <List.Item key={index}>
            <img src={item} alt={`screenshot-${index}`} style={{ width: '100%' }} />
          </List.Item>
        )}
      />
    </div>
  );
};

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

window.capture = function(command) {
  if (command === 'full size screenshot') {
    store.dispatch(captureScreenshot());
  } else {
    console.log('Unknown command');
  }
};
