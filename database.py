import psycopg

def get_conn():
    return psycopg.connect(
        dbname="gopu",
        user="ceose",
        password="agentic",
        host="sources-dl87.onrender.com",
        port=5432,
        autocommit=True
    )
