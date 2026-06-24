-- Phase 3: Align installation status values to documentation
-- Old values: pending, in_progress, completed, failed, rescheduled
-- New values: pending, assigned, ongoing, completed, cancelled

UPDATE installation SET status = 'ongoing'   WHERE status = 'in_progress';
UPDATE installation SET status = 'cancelled' WHERE status = 'failed';
UPDATE installation SET status = 'pending'   WHERE status = 'rescheduled';
