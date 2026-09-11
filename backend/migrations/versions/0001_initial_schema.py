"""Initial schema for users, items, item_files, claims

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-09-11 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('student_id', sa.String(length=100), nullable=False),
        sa.Column('phone', sa.String(length=50), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('profile_photo', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_id', 'users', ['id'], unique=False)
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_student_id', 'users', ['student_id'], unique=True)

    # 2. items table
    op.create_table(
        'items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('item_type', sa.String(length=20), nullable=False),
        sa.Column('item_name', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('event_date', sa.String(length=50), nullable=False),
        sa.Column('event_time', sa.String(length=50), nullable=True),
        sa.Column('location', sa.String(length=100), nullable=False),
        sa.Column('current_location', sa.Text(), nullable=True),
        sa.Column('additional_details', sa.Text(), nullable=True),
        sa.Column('contact_phone', sa.String(length=50), nullable=False),
        sa.Column('contact_email', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='ACTIVE'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_items_id', 'items', ['id'], unique=False)
    op.create_index('ix_items_user_id', 'items', ['user_id'], unique=False)
    op.create_index('ix_items_type', 'items', ['item_type'], unique=False)
    op.create_index('ix_items_status', 'items', ['status'], unique=False)
    op.create_index('ix_items_category', 'items', ['category'], unique=False)
    op.create_index('ix_items_location', 'items', ['location'], unique=False)
    op.create_index('ix_items_event_date', 'items', ['event_date'], unique=False)
    op.create_index('ix_items_type_status', 'items', ['item_type', 'status'], unique=False)

    # 3. item_files table
    op.create_table(
        'item_files',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('item_id', sa.Integer(), nullable=False),
        sa.Column('file_name', sa.String(length=255), nullable=False),
        sa.Column('file_path', sa.String(length=500), nullable=False),
        sa.Column('file_type', sa.String(length=100), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['item_id'], ['items.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_item_files_id', 'item_files', ['id'], unique=False)
    op.create_index('ix_item_files_item_id', 'item_files', ['item_id'], unique=False)

    # 4. claims table
    op.create_table(
        'claims',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('item_id', sa.Integer(), nullable=False),
        sa.Column('claimant_id', sa.Integer(), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='PENDING'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['item_id'], ['items.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['claimant_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_claims_id', 'claims', ['id'], unique=False)
    op.create_index('ix_claims_item_id', 'claims', ['item_id'], unique=False)
    op.create_index('ix_claims_claimant_id', 'claims', ['claimant_id'], unique=False)

def downgrade() -> None:
    op.drop_table('claims')
    op.drop_table('item_files')
    op.drop_table('items')
    op.drop_table('users')
