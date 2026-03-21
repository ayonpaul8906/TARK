from algosdk.v2client import algod
from algosdk import account, mnemonic, transaction
import os
from dotenv import load_dotenv

load_dotenv()

ALGOD_ADDRESS = os.getenv("ALGOD_ADDRESS")
ALGOD_API_KEY = os.getenv("ALGOD_API_KEY")
MNEMONIC = os.getenv("WALLET_MNEMONIC")

# Client
algod_client = algod.AlgodClient(ALGOD_API_KEY, ALGOD_ADDRESS)

# Wallet
private_key = mnemonic.to_private_key(MNEMONIC)
sender_address = account.address_from_private_key(private_key)


def store_hash_on_chain(report_hash):

    params = algod_client.suggested_params()

    txn = transaction.PaymentTxn(
        sender=sender_address,
        sp=params,
        receiver=sender_address,  # self tx (cheap + simple)
        amt=0,  # zero Algo
        note=report_hash.encode()
    )

    signed_txn = txn.sign(private_key)

    tx_id = algod_client.send_transaction(signed_txn)

    return tx_id