import { useEffect, useState } from 'react';
import './App.css';
import { initializeApp } from 'firebase/app';
import { firebaseConfig, vapidKey } from './config'
import { deleteToken, getMessaging, getToken, MessagePayload, onMessage } from 'firebase/messaging';

function App() {
  const [isShowToken, setIsShowToken] = useState(false);
  const [isShowPermission, setIsShowPermission] = useState(true);
  const [nowToken, setNowToken] = useState('');
  const [messages, setMessages] = useState<MessagePayload[]>([]);

  initializeApp(firebaseConfig);

  const messaging = getMessaging();
  
  // IDs of divs that display registration token UI or request permission UI.
  const tokenDivId = 'token_div';
  const permissionDivId = 'permission_div';
  
  // Handle incoming messages. Called when:
  // - a message is received while the app has focus
  // - the user clicks on an app notification created by a service worker
  //   `messaging.onBackgroundMessage` handler.
  onMessage(messaging, (payload) => {
    console.log('Message received. ', payload);
    // Update the UI to include the received message.
    appendMessage(payload);
  });
  
  function resetUI() {
    clearMessages();
    showToken('loading...');
    // Get registration token. Initially this makes a network call, once retrieved
    // subsequent calls to getToken will return from cache.
    getToken(messaging, { vapidKey }).then((currentToken) => {
      if (currentToken) {
        sendTokenToServer(currentToken);
        updateUIForPushEnabled(currentToken);
      } else {
        // Show permission request.
        console.log('No registration token available. Request permission to generate one.');
        // Show permission UI.
        updateUIForPushPermissionRequired();
        setTokenSentToServer(false);
      }
    }).catch((err) => {
      console.log('An error occurred while retrieving token. ', err);
      showToken('Error retrieving registration token.');
      setTokenSentToServer(false);
    });
  }
  
  
  function showToken(currentToken: string) {
    // Show token in console and UI.
    setNowToken(currentToken);
  }
  
  // Send the registration token your application server, so that it can:
  // - send messages back to this app
  // - subscribe/unsubscribe the token from topics
  function sendTokenToServer(currentToken: string) {
    if (!isTokenSentToServer()) {
      console.log('Sending token to server...', currentToken);
      // TODO(developer): Send the current token to your server.
      setTokenSentToServer(true);
    } else {
      console.log('Token already sent to server so won\'t send it again unless it changes');
    }
  }
  
  function isTokenSentToServer() {
    return window.localStorage.getItem('sentToServer') === '1';
  }
  
  function setTokenSentToServer(sent: boolean) {
    window.localStorage.setItem('sentToServer', sent ? '1' : '0');
  }
  
  function showHideDiv(divId: string, show: boolean) {
    if (divId === tokenDivId) {
      setIsShowToken(show);
    } else if (divId === permissionDivId) {
      setIsShowPermission(show);
    }
  }
  
  function requestPermission() {
    console.log('Requesting permission...');
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        // TODO(developer): Retrieve a registration token for use with FCM.
        // In many cases once an app has been granted notification permission,
        // it should update its UI reflecting this.
        resetUI();
      } else {
        console.log('Unable to get permission to notify.');
      }
    });
  }
  
  function deleteTokenFromFirebase() {
    // Delete registration token.
    getToken(messaging).then((currentToken) => {
      deleteToken(messaging).then(() => {
        console.log('Token deleted.', currentToken);
        setTokenSentToServer(false);
        // Once token is deleted update UI.
        resetUI();
      }).catch((err) => {
        console.log('Unable to delete token. ', err);
      });
    }).catch((err) => {
      console.log('Error retrieving registration token. ', err);
      showToken('Error retrieving registration token.');
    });
  }
  
  // Add a message to the messages element.
  function appendMessage(payload: MessagePayload) {
    setMessages([...messages, payload]);
  }
  
  // Clear the messages element of all children.
  function clearMessages() {
    setMessages([]);
  }
  
  function updateUIForPushEnabled(currentToken: string) {
    showHideDiv(tokenDivId, true);
    showHideDiv(permissionDivId, false);
    showToken(currentToken);
  }
  
  function updateUIForPushPermissionRequired() {
    showHideDiv(tokenDivId, false);
    showHideDiv(permissionDivId, true);
  }
  
  useEffect(() => {
    resetUI();
  }, []);

  return (
    <div className="App">
      {isShowToken && 
        <div id='token_div'>
          <h4>Registration Token</h4>
          {nowToken && <textarea id='token' value={nowToken} readOnly></textarea>}
          <button id='delete-token-button' onClick={deleteTokenFromFirebase}>Delete Token</button>
        </div>
      }

      {isShowPermission && 
        <div id='permission_div'>
          <h4>Needs Permission</h4>
          <button id='request-permission-button' onClick={requestPermission}>Request Permission</button>
        </div>
      }
      <div id='messages'>
        <h4>Messages</h4>
        <ul>
          {messages.map((message, index) => (
            <li key={index}>{JSON.stringify(message)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
