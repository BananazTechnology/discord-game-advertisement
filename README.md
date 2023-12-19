# Discord Bot for Game Advertisements
---
## Environment Info
```
DSCRD_BOT_TK="token"
CONFIG_FILE="/path/to/config.json"
```
---
## The `CONFIG_FILE`
This document is to be stored alongside the bot, in a container environment this file will need to be created and placed in the location you point to with the environment variable.

This is a minimal example of the file:
```json
[
    {
        "channelId": "1003839131731890246",
        "mode": "minecraft",
        "host": "server.com"
    }
]
```

In this file you have a outermost array which can contain as many of these, as I call them `advertisement objects` as you want:

| Key Name | Required | Default | Description |
|---|---|---|---|
| cron |  | */30 * * * * * | This is a typical Cron expression |
| channelId | true |  | A channel which is on a server the provided Discord token has access to |
| mode | true |  | Any supported [GameDig Games]() |
| host | true |  | Any valid server hostname or raw IP, no ports supported in this string |
| image |  |  | Any direct image URL like `https://a.io/img.png` sets as thumbnail |
| notes |  |  | Any single string with text, supports light markdown values like `**`, `\n`, etc.. |
---
## Container Runtime
This application should be run in docker.

### Docker
See [docker-compose](docker-compose.yaml)

---
## Contact
Aaron Renner <aaron@bananaz.tech>