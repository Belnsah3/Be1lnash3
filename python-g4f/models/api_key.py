from tortoise import models, fields

class APIKey(models.Model):
    key = fields.TextField(pk=True) # UUID-4 API key
    created_at = fields.DatetimeField(auto_now_add=True)
    remark = fields.CharField(max_length=255, null=True)
    