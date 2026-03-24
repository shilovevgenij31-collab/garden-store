"""ЮKassa payment integration stub.

Future: implement create_payment() and handle_webhook() using yookassa SDK.
"""


async def create_payment(order) -> str:
    """Create payment for order, return payment URL."""
    raise NotImplementedError("ЮKassa integration not yet implemented")


async def handle_webhook(payload: dict) -> None:
    """Process payment webhook, update order status."""
    raise NotImplementedError("ЮKassa webhook handler not yet implemented")
