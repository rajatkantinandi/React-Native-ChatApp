> Note: this project does not work anymore & is readonly since pusher has stopped their chatkit service as of April, 2020. More details here: https://getstream.io/blog/pusher-shutting-down-chatkit/. If anyone wants to fork this & use some other API to rebuild this app, they are welcome. 

<p align="center"><img src='assets/icon.png' alt='logo'/><h1>React Native ChatApp</h1></p>

### ChatApp built using React Native with @pusher/ChatKit API

### Expo Link : [ChatApp](https://expo.io/@rajatkn/ChatApp)

#### Features

- Login/Sign Up
- Create a private/public room
- Join a public room
- Private chat with a user having a username
- Push Notifications (Via ExpoPushToken)
- Message Sent Indicator
- Leave a room
- Rename Room
- Add user to room
- Delete room that you have created

#### Upcoming Features

- Message Received indicator
- Online user indicator for private chat with a user
- Room Info
- Chat themes including dark theme

#### To Contribute

- Clone the repo
- Create a new branch with "Fix-&lt;your-fix&gt;" or "Feature-&lt;your-feature&gt;"
- To test your chatkit instance create an account at [Pusher.com](https://dashboard.pusher.com/accounts/sign_up "Sign Up @pusher") & create your chatkit instance
- Rename the "credentials.1.js" to "credentials.js" & put your &lt;instance-locator&gt;, &lt;server-key&gt;, &lt;instance-id&gt; & &lt;your-test-token-provider-url&gt;in the file & save the file
- npm install to install all dependencies
- You need to have expo installed as a global npm package
- Run "expo start" & launch the app on device or emulator for testing
- After implementing your modifications create a commit & push it to gitHub & create a pull request with a description
- After reviewing your request will be merged
