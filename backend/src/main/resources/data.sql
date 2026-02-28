-- Seed roles if they don't exist
INSERT INTO roles (name) VALUES ('CLIENT') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('FREELANCER') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('ADMIN') ON CONFLICT (name) DO NOTHING;
