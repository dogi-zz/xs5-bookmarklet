
Script at:
https://dogi-zz.github.io/work_times/script.js

Bookmarklet is:
```
javascript:(function(){  const script = document.createElement('script');  script.src = 'https://dogi-zz.github.io/work_times/script.js';  script.type = 'text/javascript';  script.onload = function() {      console.log('Script geladen und ausgeführt.');  };  script.onerror = function() {      console.error('Fehler beim Laden des Scripts.');      alert('Das Skript konnte nicht geladen werden. Überprüfe, ob der Server läuft.');  };  document.head.appendChild(script);})();
```
