import{O as e,C as n}from"./constants-P2LeYaIH.js";const o=document.querySelector("#bs-whatsnew"),a=document.querySelector("#bs-whatsnew-notes");o.innerHTML=`
  <div id="newsContainer">
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
