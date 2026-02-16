-- ===========================================
-- StayNeos Row Level Security (RLS) 策略
-- 在 Supabase Dashboard → SQL Editor 中执行
-- ===========================================

-- 启用 RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CleaningTask" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Property" ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- User 表策略
-- ===========================================

-- 用户可以查看自己的信息
CREATE POLICY "Users can view own profile" ON "User"
  FOR SELECT USING (auth.uid()::text = id);

-- 用户可以更新自己的信息
CREATE POLICY "Users can update own profile" ON "User"
  FOR UPDATE USING (auth.uid()::text = id);

-- 管理员可以查看所有用户
CREATE POLICY "Admins can view all users" ON "User"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- ===========================================
-- Property 表策略
-- ===========================================

-- 所有人可以查看已发布的房源
CREATE POLICY "Anyone can view published properties" ON "Property"
  FOR SELECT USING (status = 'PUBLISHED');

-- 管理员可以管理所有房源
CREATE POLICY "Admins can manage all properties" ON "Property"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- ===========================================
-- Booking 表策略
-- ===========================================

-- 用户可以查看自己的预订
CREATE POLICY "Users can view own bookings" ON "Booking"
  FOR SELECT USING (
    user_id = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- 用户可以创建自己的预订
CREATE POLICY "Users can create own bookings" ON "Booking"
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- 用户可以更新自己的预订（仅限取消）
CREATE POLICY "Users can update own bookings" ON "Booking"
  FOR UPDATE USING (
    user_id = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- ===========================================
-- CleaningTask 表策略
-- ===========================================

-- 房东和管理员可以查看清洁任务
CREATE POLICY "Hosts and admins can view cleaning tasks" ON "CleaningTask"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text AND role IN ('HOST', 'ADMIN', 'SUPER_ADMIN')
    )
  );

-- 房东和管理员可以管理清洁任务
CREATE POLICY "Hosts and admins can manage cleaning tasks" ON "CleaningTask"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text AND role IN ('HOST', 'ADMIN', 'SUPER_ADMIN')
    )
  );

-- ===========================================
-- Payment 表策略
-- ===========================================

-- 用户可以查看自己的支付记录
CREATE POLICY "Users can view own payments" ON "Payment"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Booking" WHERE id = "Payment".booking_id AND user_id = auth.uid()::text
    ) OR
    EXISTS (
      SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- ===========================================
-- Review 表策略
-- ===========================================

-- 所有人可以查看评价
CREATE POLICY "Anyone can view reviews" ON "Review"
  FOR SELECT USING (true);

-- 用户可以创建自己的评价
CREATE POLICY "Users can create own reviews" ON "Review"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Booking" 
      WHERE id = "Review".booking_id 
      AND user_id = auth.uid()::text 
      AND status = 'CHECKED_OUT'
    )
  );

-- ===========================================
-- 创建触发器函数: 预订确认时自动创建清洁任务
-- ===========================================

CREATE OR REPLACE FUNCTION create_cleaning_task_on_checkout()
RETURNS TRIGGER AS $$
BEGIN
  -- 当预订状态变为 CONFIRMED 时，创建清洁任务
  IF NEW.status = 'CONFIRMED' AND (OLD.status IS NULL OR OLD.status != 'CONFIRMED') THEN
    INSERT INTO "CleaningTask" (
      id,
      "bookingId",
      type,
      status,
      "scheduledAt",
      priority,
      notes,
      "beforePhotos",
      "afterPhotos",
      checklist,
      "createdAt",
      "updatedAt"
    ) VALUES (
      gen_random_uuid(),
      NEW.id,
      'CHECKOUT_CLEANING',
      'SCHEDULED',
      NEW."checkOut" + INTERVAL '11 hours',
      'NORMAL',
      '自动创建的退房清洁任务',
      ARRAY[]::text[],
      ARRAY[]::text[],
      '{}'::jsonb,
      NOW(),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS booking_create_cleaning_task ON "Booking";
CREATE TRIGGER booking_create_cleaning_task
  AFTER INSERT OR UPDATE OF status ON "Booking"
  FOR EACH ROW
  EXECUTE FUNCTION create_cleaning_task_on_checkout();

-- ===========================================
-- 创建函数: 更新逾期清洁任务
-- ===========================================

CREATE OR REPLACE FUNCTION update_overdue_cleaning_tasks()
RETURNS void AS $$
BEGIN
  UPDATE "CleaningTask"
  SET status = 'OVERDUE'
  WHERE status IN ('SCHEDULED', 'IN_PROGRESS')
    AND "scheduledAt" < NOW();
END;
$$ LANGUAGE plpgsql;
