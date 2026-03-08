-- Update plan descriptions to use the correct brand name

UPDATE public.plans
SET description = REPLACE(description, 'MicroCred SaaS', 'Gestão Flex')
WHERE description LIKE '%MicroCred SaaS%';
