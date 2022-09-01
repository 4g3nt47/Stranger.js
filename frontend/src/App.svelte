<script>
  
  /**
   * @file The main app component for Stranger.js
   * @author Umar Abdul
   */

  import {onMount} from 'svelte';
  import {io} from 'socket.io-client';

  const backend = "ws://localhost:3000"; // The backend ws server
  let socket = null;
  let waiting = true;
  let message = "";
  let messages = [];
  
  /**
   * Connect to the ws server
   */
  const connect = () => {

    waiting = true;
    socket = io(backend);
    socket.on("message", (message) => {
      messages = [...messages, message];
      // Scroll to the bottom of the messages div
      setTimeout(() => {
        let div = document.getElementById("messages");
        div.scrollTop = div.scrollHeight;        
      }, 50); // Need to do it this way since scrolling before the content is rendered will hide the new line
    });
    // Called when client is paired with another user.
    socket.on("user connect", () => {
      waiting = false;
      messages = [];
    });
    // Called when the other client disconnect.
    socket.on("user disconnect", () => {
      connect();
    });
  };

  /**
   * Send message.
   */
  const sendMessage = async () => {

    if (waiting === true || socket == null || message.length === 0)
      return;
    socket.emit("message", message);
    message = "";
  };

  onMount(() => {
    connect();
    document.getElementById("input-msg").focus();
  });

</script>

<div class="main">
  <h1>Stranger.js</h1>
  {#if (waiting)}
    <p>Waiting for another user...</p>
  {:else}
    <!-- Messages view -->
    <div id="messages" class="messages">    
      <ul>
        {#each messages as message}
          <li><span class="user">{message.user}</span>: {message.msg}</li>
        {/each}
      </ul>
    </div>
  {/if}
  <!-- Message input field -->
  <div class="input-panel">
    <input id="input-msg" class="input-msg" type="text" placeholder="message" bind:value={message} on:change={sendMessage}>
  </div>
</div>

<style>
  
  h1{
    text-align: center;
  }

  .main{
    width: 70%;
    margin: 0px auto;
    margin-top: 2em;
    border: 2px solid black;
    border-radius: 10px;
    padding: 1em 2em;
    background-color: #e7e7e7;

  }

  .messages{
    height: 300px;
    overflow-y: scroll;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .messages::-webkit-scrollbar {
    display: none;
  }

  ul{
    list-style-type: none;
    margin: 0px;
    padding: 0px;
  }

  ul li{
    font-size: 14pt;
    border-bottom: 1px solid black;
    padding: 7px 0px;
  }

  .user{
    display: inline-block;
    min-width: 100px;
    text-align: right;
    font-weight: bold;
    font-style: italic;
  }

  .input-panel{
    margin: 10px 2px;
  }

  .input-panel input[type="text"]{
    display: inline-block;
    width: 100%;
    padding-left: 5px;
    line-height: 1.8em;
    font-size: 11pt;
  }

</style>