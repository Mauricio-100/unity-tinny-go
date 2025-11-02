from sqlalchemy import Column, String, Integer, Boolean, Text, ForeignKey
from database import Base

class User(Base):
    __tablename__ = "users"
    email = Column(String, primary_key=True, index=True)
    password = Column(String)
    otp = Column(String)
    verified = Column(Boolean, default=False)

class Package(Base):
    __tablename__ = "packages"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    version = Column(String)
    source = Column(Text)
    metadata = Column(Text)
    downloads = Column(Integer, default=0)
