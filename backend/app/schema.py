from decimal import Decimal
from typing import Literal
from pydantic import BaseModel, Field, model_validator


class OrderRequest(BaseModel):
    """Incoming order from the frontend."""

    user_id: str = Field(..., min_length=1, max_length=64)
    ticker: str = Field(..., min_length=1, max_length=16)
    side: Literal["bid", "ask"]
    qty: int = Field(..., gt=0)
    price: Decimal = Field(..., gt=Decimal("0"))

    @model_validator(mode="after")
    def price_has_at_most_two_decimals(self) -> "OrderRequest":
        # Quantize to 2dp — reject anything more granular
        quantized = self.price.quantize(Decimal("0.01"))
        if quantized != self.price:
            raise ValueError("price must have at most 2 decimal places")
        self.price = quantized
        return self

    @property
    def trade_value(self) -> Decimal:
        return self.price * self.qty


class OrderResponse(BaseModel):
    status: Literal["APPROVED", "REJECTED"]
    filled_qty: int
    remaining_qty: int
    reason: str = ""
    balance_usd: float = 0.0