# 🚀 Ft_transcendence 🚀

<h2>Overview</h2>
<p><strong>Welcome to transcendence!</strong><br>
This project aims to create an interactive platform where users can engage in real-time multiplayer Pong matches, chat with other players, and enjoy a seamless gaming experience.<br>
Below are the key components and requirements of the project:
</p>

<h3>🧑‍💻 Technologies Used:</h3>
<ul>
  <li><strong>Backend:</strong> NestJS</li>
  <li><strong>Frontend:</strong> TypeScript framework of your choice</li>
  <li><strong>Database:</strong> PostgreSQL</li>
  <li><strong>Deployment:</strong> Docker</li>
</ul>

<h3>⚙️ Features:</h3>
<ul>
  <li><strong>Real-time Multiplayer Pong:</strong> Engage in thrilling Pong matches with other players directly on the website.</li>
  <li><strong>User-friendly Interface:</strong> Enjoy a sleek and intuitive user interface for seamless navigation and gameplay.</li>
  <li><strong>Interactive Chat:</strong> Communicate with other users via public or private chat channels, send direct messages, and invite players to games.</li>
  <li><strong>User Account Management:</strong> Utilize OAuth login via 42 intranet, customize profile with unique name and avatar, enable two-factor authentication, manage friends list, and view detailed stats and match history.</li>
  <li><strong>Security Measures:</strong> Implement password hashing, protect against SQL injections, perform server-side validation for forms, and securely manage credentials.</li>
  <li><strong>Customizable Gameplay: </strong> Customize Pong game with power-ups, different maps, and other features while retaining the option for a classic Pong experience.</li>
  <li><strong>Responsive Design:</strong> Ensure compatibility with major web browsers and support for seamless navigation using browser buttons.</li>
</ul>

<h2>🦺 Security Concerns</h2>
<p>To ensure a secure environment for users, the following security measures have been implemented:</p>
<ul>
  <li>Passwords stored in the database are hashed for enhanced security.</li>
  <li>Protection against SQL injections and server-side validation for user inputs.</li>
  <li>Strong password hashing algorithms and secure management of credentials in a local .env file.</li>
</ul>

<h2>🧑‍🦱 User Account</h2>
<ul>
  <li><strong><Login:</strong> Users can log in using OAuth system of 42 intranet.</li>
  <li><strong>Profile Customization:</strong> Customize profile with a unique name and upload an avatar.</li>
  <li><strong>Two-Factor Authentication:</strong> Enable two-factor authentication for added security.</li>
  <li><strong>Friend Management:</strong> Add other users as friends, view their status, and access detailed stats.</li>
  <li><strong>Match History:</strong> View detailed match history including 1v1 games and ladder matches.</li>
</ul>

<h2>🐈 Chat</h2>
<p>The chat feature allows users to:</p>
<ul>
  <li>Create public, private, or password-protected channels.</li>
  <li>Send direct messages to other users.</li>
  <li>Block other users to stop receiving messages.</li>
  <li>Manage channel settings and invite other users to play Pong games.</li>
</ul>

<h2>🎮 Game</h2>
<p>The core feature of the website is the Pong game:</p>
<ul>
  <li>Play live Pong games versus other players directly on the website.</li>
  <li>Matchmaking system for automatic pairing with other players.</li>
  <li>Customization options such as power-ups and different maps.</li>
  <li>Responsive design for seamless gameplay across devices.</li>
</ul>

<h2>⭐ Getting Started</h2>
<p>To launch the project, simply run the following command:</p>
```bash
docker-compose up --build
```

<h2>🔄 Compatibility</h2>
<p>The website is compatible with the latest stable version of Google Chrome and one additional web browser of your choice.</p>

<h2>⛑️ Security Note (For Linux Users)</h2>
<p>If running on Linux, ensure Docker is set up in rootless mode for security reasons. Refer to project documentation for additional details.</p>

<h3>🎉 Conclusion</h3>
<p>Thank you for considering the Pong Contest Website project. We hope this README provides a comprehensive overview of the project's objectives, features, and technical requirements.</p>
