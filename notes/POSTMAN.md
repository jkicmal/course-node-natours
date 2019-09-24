# Postman

Setting environmental variable based on response.
Put it in Tests tab.

```text
pm.environment.set("jwt", pm.response.json().token);
```
