-- 初始种子数据
-- 用于开发和测试环境

-- 插入测试设施分类
INSERT INTO "AmenityCategory" (id, name, icon, "order") VALUES
  ('cat-1', '基础设施', 'Home', 1),
  ('cat-2', '厨房', 'ChefHat', 2),
  ('cat-3', '娱乐', 'Tv', 3),
  ('cat-4', '工作空间', 'Briefcase', 4),
  ('cat-5', '安全', 'Shield', 5)
ON CONFLICT (name) DO NOTHING;

-- 插入测试设施
INSERT INTO "Amenity" (id, name, icon, "categoryId") VALUES
  ('amen-1', 'Wi-Fi', 'Wifi', 'cat-1'),
  ('amen-2', '空调', 'Wind', 'cat-1'),
  ('amen-3', '洗衣机', 'WashingMachine', 'cat-1'),
  ('amen-4', '烘干机', 'Shirt', 'cat-1'),
  ('amen-5', '冰箱', 'Refrigerator', 'cat-2'),
  ('amen-6', '微波炉', 'Microwave', 'cat-2'),
  ('amen-7', '烤箱', 'Flame', 'cat-2'),
  ('amen-8', '电视', 'Tv', 'cat-3'),
  ('amen-9', '健身房', 'Dumbbell', 'cat-3'),
  ('amen-10', '办公桌', 'Desk', 'cat-4'),
  ('amen-11', '智能门锁', 'Lock', 'cat-5'),
  ('amen-12', '烟雾报警器', 'AlertTriangle', 'cat-5')
ON CONFLICT (name, "categoryId") DO NOTHING;
