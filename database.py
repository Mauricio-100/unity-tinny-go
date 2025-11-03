import psycopg2

def get_connection():
    return psycopg2.connect(
        dbname="gopu",
        user="ceose",
        password="agentic",
        host="sources-dl87.onrender.com",
        port="5432"
    )
