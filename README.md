# fcm-test-react

## 準備

firebaseのドキュメントに従ってプロジェクトを作成してください

また，以下のconfig.tsを設定する必要があります

config.ts

```ts
export const firebaseConfig = {
  apiKey: 'API_KEY',
  authDomain: 'PROJECT_ID.firebaseapp.com',
  databaseURL: 'https://PROJECT_ID.firebaseio.com',
  projectId: 'PROJECT_ID',
  storageBucket: 'PROJECT_ID.appspot.com',
  messagingSenderId: 'SENDER_ID',
  appId: 'APP_ID',
  measurementId: 'G-MEASUREMENT_ID'
};

export const vapidKey = '<YOUR_PUBLIC_VAPID_KEY_HERE>';
```

## ビルド

```zsh
npm run build
```

## deploy

```zsh
firebase deploy
```

## 参考

[Firebase Cloud Messaging Quickstart](https://github.com/firebase/quickstart-js/tree/master/messaging)
