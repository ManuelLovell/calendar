import{O as e,C as n}from"./constants-_ZGqeghE.js";const o=document.querySelector("#bs-whatsnew"),a=document.querySelector("#bs-whatsnew-notes");o.innerHTML=`
  <div id="newsContainer">
    <h1>Calendar! 3/18</h1>
    Fixed an issue with the moon phase resetting when the month changes.
    </br> Sorry for the delay on that one!
    <h1>Calendar! 3/5</h1>
    Added a toggle for the action badge text.
    </br> Calendar doesn't have a dedicated setting spot.. and I kind of like that.
    </br> So the button itself is the year name on the calendar. Now outlined in purple.
    </br> The setting should save to the room and be per-player.
    <h1>Calendar! 2/28</h1>
    I was informed that the 'starting day of the year' wasn't being respected from the DonJon Input.
    </br> Also I just.. didn't add it at all.  So that's now in there.  I know I've seen some funky stylings going on in some people's screenshots also - but I haven't been able to pinpoint which browsers those are.
    </br> So if you don't mind dropping a comment on Patreon/Discord/Reddit to let me know what you're using and if it looks funny, I'd appreciate it.
    </br>
    </br>
    <h1>Calendar! 1/10</h1>
    Welcome to Calendar!  My own campaigns pay attention to the current date and I've always appreciated the DonJon calendar - but in an effort to get everything inside of OBR and reduce the amount of windows on my screen.. here we are.
    </br>
    </br>
    No secret functionality here, this one should be pretty straight forward.  You can also import a DonJon calendar in the Import tab.
    </br>
    </br>
    Enjoy!
    </br>
    </br>
  </div>
`;e.onReady(async()=>{a.innerHTML=`
    <a href="https://www.patreon.com/battlesystem" target="_blank">Patreon!</a>
    <a href="https://discord.gg/ANZKDmWzr6" target="_blank">Join the OBR Discord!</a>
    <div class="close"><img style="height:40px; width:40px;" src="/close-button.svg"</div>`;const t=document.querySelector(".close");t.onclick=async()=>{await e.modal.close(n.EXTENSIONWHATSNEW)}});
