import{O as o,C as i}from"./bsConstants-2Wq3zd31.js";const d=document.querySelector("#bs-whatsnew"),c=document.querySelector("#bs-whatsnew-notes");d.innerHTML=`
  <div id="newsContainer">
    <h1>Calendar! 6/20</h1>
    Hello again, finally made my way back here.
    </br> I've slimmed down the foot print on this one as promised, as well as cleaned up several bugs and stylings issues.
    </br> Also you can pick your moon colors now.
    </br> This extension was initially a speed-run to see how fast I could get things done.. so.. it needed it.  It was <i>rough</i>.
    </br>
    </br> Still on the list is adding Time functionality and embedding Notes.  Notes is going to be tied to the Patreon subscription, because I can't save that much data to the Room in OBR.
    </br At any rate, this seems in a good place now - so off it goes. The other updates come later, just time fo ra break.
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
`;o.onReady(async()=>{const n=window.location.search,t=new URLSearchParams(n).get("subscriber")==="true";c.innerHTML=`
        <div id="footButtonContainer">
            <button id="discordButton" type="button" title="Join the Owlbear-Rodeo Discord"><embed class="svg discord" src="/w-discord.svg" /></button>
            <button id="patreonButton" type="button" ${t?'title="Thank you for subscribing!"':'title="Check out the Battle-System Patreon"'}>
            ${t?'<embed id="patreonLogo" class="svg thankyou" src="/w-thankyou.svg" />':'<embed id="patreonLogo" class="svg patreon" src="/w-patreon.png" />'}</button>
        </div>
        <button id="closeButton" type="button" title="Close this window"><embed class="svg close" src="/w-close.svg" /></button>
        `;const a=document.getElementById("closeButton");a.onclick=async()=>{await o.modal.close(i.EXTENSIONWHATSNEW)};const s=document.getElementById("discordButton");s.onclick=async e=>{e.preventDefault(),window.open("https://discord.gg/ANZKDmWzr6","_blank")};const r=document.getElementById("patreonButton");r.onclick=async e=>{e.preventDefault(),window.open("https://www.patreon.com/battlesystem","_blank")}});
