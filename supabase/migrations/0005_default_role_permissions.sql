-- ============================================================================
-- 0005_default_role_permissions.sql
-- System-default permission matrix (organization_id = null rows).
-- Organizations can override any of these later by inserting their own
-- (organization_id, role, module) row - see policy in 0003.
--
-- SUPER_ADMIN and ADMIN are handled specially in auth_has_permission() and
-- do not need explicit rows here (they always pass).
-- ============================================================================

insert into role_permissions (organization_id, role, module, permissions) values
  -- SALES
  (null, 'SALES', 'CRM',         '{VIEW,CREATE,EDIT,EXPORT}'),
  (null, 'SALES', 'DEALS',       '{VIEW,CREATE,EDIT}'),
  (null, 'SALES', 'CLIENTS',     '{VIEW,EDIT}'),
  (null, 'SALES', 'CALENDAR',    '{VIEW,CREATE,EDIT}'),
  (null, 'SALES', 'COMMUNICATIONS', '{VIEW,CREATE}'),
  (null, 'SALES', 'TASKS',       '{VIEW,CREATE,EDIT}'),
  (null, 'SALES', 'AI',          '{VIEW}'),

  -- MARKETING
  (null, 'MARKETING', 'CONTENT',    '{VIEW,CREATE,EDIT}'),
  (null, 'MARKETING', 'CAMPAIGNS',  '{VIEW,CREATE,EDIT}'),
  (null, 'MARKETING', 'CRM',        '{VIEW}'),
  (null, 'MARKETING', 'ANALYTICS',  '{VIEW}'),
  (null, 'MARKETING', 'TASKS',      '{VIEW,CREATE,EDIT}'),
  (null, 'MARKETING', 'AI',         '{VIEW}'),

  -- PROJECT_MANAGER
  (null, 'PROJECT_MANAGER', 'PROJECTS', '{VIEW,CREATE,EDIT,MANAGE}'),
  (null, 'PROJECT_MANAGER', 'TASKS',    '{VIEW,CREATE,EDIT,DELETE,MANAGE}'),
  (null, 'PROJECT_MANAGER', 'CLIENTS',  '{VIEW}'),
  (null, 'PROJECT_MANAGER', 'CALENDAR', '{VIEW,CREATE,EDIT}'),
  (null, 'PROJECT_MANAGER', 'DOCUMENTS','{VIEW,CREATE,EDIT}'),
  (null, 'PROJECT_MANAGER', 'AI',       '{VIEW}'),

  -- RECRUITMENT
  (null, 'RECRUITMENT', 'CAREERS', '{VIEW,CREATE,EDIT,MANAGE}'),
  (null, 'RECRUITMENT', 'TEAM',    '{VIEW}'),
  (null, 'RECRUITMENT', 'AI',      '{VIEW}'),

  -- FINANCE
  (null, 'FINANCE', 'FINANCE',   '{VIEW,CREATE,EDIT,APPROVE,EXPORT,MANAGE}'),
  (null, 'FINANCE', 'INVOICES',  '{VIEW,CREATE,EDIT,APPROVE,EXPORT,MANAGE}'),
  (null, 'FINANCE', 'CONTRACTS', '{VIEW,EDIT}'),
  (null, 'FINANCE', 'CLIENTS',   '{VIEW}'),
  (null, 'FINANCE', 'AI',        '{VIEW}'),

  -- SUPPORT
  (null, 'SUPPORT', 'SUPPORT',   '{VIEW,CREATE,EDIT,MANAGE}'),
  (null, 'SUPPORT', 'KNOWLEDGE', '{VIEW,CREATE,EDIT}'),
  (null, 'SUPPORT', 'CLIENTS',   '{VIEW}'),
  (null, 'SUPPORT', 'AI',        '{VIEW}'),

  -- MEMBER (baseline: read-only on shared modules, own tasks/calendar)
  (null, 'MEMBER', 'TASKS',      '{VIEW,CREATE,EDIT}'),
  (null, 'MEMBER', 'CALENDAR',   '{VIEW,CREATE,EDIT}'),
  (null, 'MEMBER', 'KNOWLEDGE',  '{VIEW}'),
  (null, 'MEMBER', 'DOCUMENTS',  '{VIEW}'),
  (null, 'MEMBER', 'AI',         '{VIEW}');
