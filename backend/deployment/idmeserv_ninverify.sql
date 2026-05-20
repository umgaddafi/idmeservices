-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 15, 2026 at 12:02 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE DATABASE IF NOT EXISTS `idmeserv_ninverify` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `idmeserv_ninverify`;

--
-- Database: `idmeserv_ninverify`
--

-- --------------------------------------------------------

--
-- Table structure for table `api_tokens`
--

CREATE TABLE `api_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT 'web',
  `token_hash` varchar(255) NOT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `api_tokens`
--

INSERT INTO `api_tokens` (`id`, `user_id`, `name`, `token_hash`, `expires_at`, `created_at`, `updated_at`) VALUES
(7, 2, 'web', '1656e1306c53ea3ee39358bd18e65880c46a87d50b936c1f6423bec8f56b8e09', '2026-05-18 09:37:41', '2026-05-11 09:37:41', '2026-05-11 09:37:41'),
(9, 5, 'web', '76a191fecd8516cbfc04d181a199356a922ac17173cd11e675da46fe68387ddf', '2026-05-18 11:47:10', '2026-05-11 11:47:10', '2026-05-11 11:47:10'),
(12, 5, 'web', '0e5646daac19b8ebf33edb48dfe597da656204f00dfa440b18a8d280824491ee', '2026-05-18 12:37:30', '2026-05-11 12:37:30', '2026-05-11 12:37:30'),
(13, 6, 'web', '69a58c774991597aad5d9797417cddb74c1863a5b05f5ba72f6921a990458e4e', '2026-05-18 12:45:00', '2026-05-11 12:45:00', '2026-05-11 12:45:00'),
(14, 5, 'web', '659ea1e9d9490f8da690be8980b4edf64ab9dc7c3608d3060a883dac1dafaaff', '2026-05-18 13:17:56', '2026-05-11 13:17:56', '2026-05-11 13:17:56'),
(15, 5, 'web', 'c73a77fb95735bb603373ddc62ad73c69f102fc82a7af7ef233ce5b6d8ea8a0d', '2026-05-18 14:18:30', '2026-05-11 14:18:30', '2026-05-11 14:18:30'),
(16, 3, 'web', 'f3c660b507b0838e640f4437a1ee50126d6f590280052aefbfa8bc3d36fe5697', '2026-05-19 07:04:26', '2026-05-12 07:04:26', '2026-05-12 07:04:26'),
(18, 5, 'web', '1e4de302bff224313ba394f0fa6b31e54c30e67d9683e562f2fc19ecac3921d2', '2026-05-19 07:10:08', '2026-05-12 07:10:08', '2026-05-12 07:10:08'),
(21, 1, 'web', '7fccbb00e1aa2946368e8dc33aa490b67927a4c887c6a5203e4af2b4ef796f29', '2026-05-19 09:34:03', '2026-05-12 09:34:03', '2026-05-12 09:34:03'),
(22, 5, 'web', 'e594e85df9eb03e868ae3dd35a63161c6d5a923a03248de8cce29fe407c261e9', '2026-05-19 10:04:09', '2026-05-12 10:04:09', '2026-05-12 10:04:09'),
(23, 7, 'web', 'a72692e1e39279d005086b2d4741882a03acc0cb973bf5c9d0b48d28946d9aac', '2026-05-19 11:00:53', '2026-05-12 11:00:53', '2026-05-12 11:00:53'),
(24, 1, 'web', '353b6e949aa60e09d2b605dbb6c633a5850d629c636889a24e9aa8a31f7a9d79', '2026-05-19 11:01:37', '2026-05-12 11:01:37', '2026-05-12 11:01:37'),
(28, 5, 'web', '0627d0db0d960dde0949d7dabd5255060b5134a7d714abe1440f2aee301580d4', '2026-05-19 23:55:47', '2026-05-12 23:55:47', '2026-05-12 23:55:47'),
(29, 5, 'web', '68cc22a349f210e9d5a4e64474a8cf4d8717d2a99213f5e5f31b38b3257b4273', '2026-05-20 11:22:33', '2026-05-13 11:22:33', '2026-05-13 11:22:33'),
(30, 5, 'web', '9fb2a8e3cfc7792b73db1bfcbc1808dbe712e5eea6349d8be61002db3998a9d2', '2026-05-20 11:30:27', '2026-05-13 11:30:27', '2026-05-13 11:30:27'),
(31, 5, 'web', 'ff33e0e266cc8081a5ff350eec83bbe47e4f98cce6da94c8458b468d962434b0', '2026-05-20 11:30:29', '2026-05-13 11:30:29', '2026-05-13 11:30:29'),
(33, 5, 'web', '6f020f70521377641f7817b45a370e898ebb944b6b801ca42f3d590399822fd0', '2026-05-20 11:31:51', '2026-05-13 11:31:51', '2026-05-13 11:31:51'),
(35, 5, 'web', 'c2cfbea952264a896f1ed97baac161ba71c3cdd48994bcf3edb8922ece23ec70', '2026-05-20 11:34:15', '2026-05-13 11:34:15', '2026-05-13 11:34:15'),
(38, 5, 'web', '8f9cf1a4f9ef8ad537605b7bcc95083340cc19ab35d121f7bfd123d0abed30ba', '2026-05-21 12:24:06', '2026-05-14 12:24:06', '2026-05-14 12:24:06'),
(40, 1, 'web', '3bbc48fe03b3bcdc6fc68ee097d50a824d418165c4106162c7feecc5a0860ac0', '2026-05-21 13:36:48', '2026-05-14 13:36:48', '2026-05-14 13:36:48'),
(41, 1, 'web', 'e129ab9e531601924105afcaec34c152f17e71b39f3c90e903b2aef722450409', '2026-05-22 07:21:41', '2026-05-15 07:21:41', '2026-05-15 07:21:41');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `actor_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `target_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `actor` varchar(255) NOT NULL,
  `actor_role` varchar(255) NOT NULL,
  `target` varchar(255) NOT NULL,
  `action` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Completed',
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `actor_user_id`, `target_user_id`, `actor`, `actor_role`, `target`, `action`, `status`, `metadata`, `timestamp`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 'Admin Officer', 'ADMIN', 'Bootstrap Seed', 'System Initialized', 'Completed', '{\"seeded\":true}', '2026-05-09 20:43:51', '2026-05-09 20:43:51', '2026-05-09 20:43:51'),
(2, 1, 2, 'Admin Officer', 'ADMIN', 'BVN response mismatch', 'Support Ticket Assigned', 'Completed', '{\"channel\":\"Verification\"}', '2026-05-09 19:43:51', '2026-05-09 20:43:51', '2026-05-09 20:43:51'),
(3, 2, 2, 'Gaddafi Umar', 'MEMBER', 'BVN-SWOMIRR9', 'BVN Verification Completed', 'Completed', '{\"transactionReference\":\"TXN-PK0OI0TYBJ\",\"walletBalance\":48830}', '2026-05-09 21:59:45', '2026-05-09 21:59:45', '2026-05-09 21:59:45'),
(4, 3, 3, 'Shamad Mufti', 'MEMBER', 'umgaddafi6@gmail.com', 'Member Registered', 'Completed', '{\"memberId\":\"MB-1001\"}', '2026-05-09 22:21:43', '2026-05-09 22:21:43', '2026-05-09 22:21:43'),
(5, 4, 4, 'GADDAFI UMAR', 'MEMBER', 'gaddafiumar4445@gmail.com', 'Member Registered', 'Completed', '{\"memberId\":\"MB-1002\"}', '2026-05-10 07:32:05', '2026-05-10 07:32:05', '2026-05-10 07:32:05'),
(6, 5, 5, 'Shamad Mufti', 'MEMBER', 'umgaddafi1@gmail.com', 'Member Registered', 'Completed', '{\"memberId\":\"MB-1003\"}', '2026-05-11 11:47:07', '2026-05-11 11:47:07', '2026-05-11 11:47:07'),
(7, 5, 5, 'Shamad Mufti', 'MEMBER', 'NIN-KCXQFTJR', 'NIN Verification Completed', 'Completed', '{\"transactionReference\":\"TXN-SU0USA38WF\",\"walletBalance\":50}', '2026-05-11 12:37:44', '2026-05-11 12:37:44', '2026-05-11 12:37:44'),
(8, 6, 6, 'kehinde adefemi', 'MEMBER', 'accestoreng@gmail.com', 'Member Registered', 'Completed', '{\"memberId\":\"MB-1004\"}', '2026-05-11 12:44:57', '2026-05-11 12:44:57', '2026-05-11 12:44:57'),
(9, 7, 7, 'Smoke Test', 'MEMBER', 'smoke1778587227@example.com', 'Member Registered', 'Completed', '{\"memberId\":\"MB-1005\"}', '2026-05-12 11:00:29', '2026-05-12 11:00:29', '2026-05-12 11:00:29'),
(10, 1, NULL, 'Admin Officer', 'ADMIN', 'Global Config', 'System Settings Updated', 'Completed', NULL, '2026-05-12 23:22:24', '2026-05-12 23:22:24', '2026-05-12 23:22:24'),
(11, 5, 5, 'Shamad Mufti', 'MEMBER', 'NIN-MOD-DFOYAXGPAF', 'PHONE NUMBER MODIFICATION Submitted', 'Completed', '{\"transactionReference\":\"TXN-CZPJEAJLPX\",\"walletBalance\":49}', '2026-05-12 23:25:10', '2026-05-12 23:25:10', '2026-05-12 23:25:10'),
(12, 1, 5, 'Admin Officer', 'ADMIN', 'NIN-MOD-DFOYAXGPAF', 'Service Request Status Updated', 'Completed', '{\"serviceRequestStatus\":\"Completed\"}', '2026-05-12 23:29:29', '2026-05-12 23:29:29', '2026-05-12 23:29:29'),
(13, 1, 5, 'Admin Officer', 'ADMIN', 'NIN-MOD-DFOYAXGPAF', 'Service Request Status Updated', 'Completed', '{\"serviceRequestStatus\":\"New Request\"}', '2026-05-12 23:29:30', '2026-05-12 23:29:30', '2026-05-12 23:29:30'),
(14, 1, 5, 'Admin Officer', 'ADMIN', 'NIN-MOD-DFOYAXGPAF', 'Service Request Status Updated', 'Completed', '{\"serviceRequestStatus\":\"Completed\"}', '2026-05-12 23:29:32', '2026-05-12 23:29:32', '2026-05-12 23:29:32'),
(15, 1, 5, 'Admin Officer', 'ADMIN', 'NIN-MOD-DFOYAXGPAF', 'Service Request Status Updated', 'Completed', '{\"serviceRequestStatus\":\"New Request\"}', '2026-05-14 14:30:16', '2026-05-14 14:30:16', '2026-05-14 14:30:16'),
(16, 1, 5, 'Admin Officer', 'ADMIN', 'NIN-MOD-DFOYAXGPAF', 'Service Request Status Updated', 'Completed', '{\"serviceRequestStatus\":\"Completed\"}', '2026-05-14 14:30:22', '2026-05-14 14:30:22', '2026-05-14 14:30:22'),
(17, 1, NULL, 'Admin Officer', 'ADMIN', 'Global Config', 'System Settings Updated', 'Completed', NULL, '2026-05-14 14:34:55', '2026-05-14 14:34:55', '2026-05-14 14:34:55'),
(18, 1, 2, 'Admin Officer', 'ADMIN', 'BVN response mismatch', 'Support Ticket Updated', 'Investigating', NULL, '2026-05-14 14:40:57', '2026-05-14 14:40:57', '2026-05-14 14:40:57'),
(19, 1, NULL, 'Admin Officer', 'ADMIN', 'Global Config', 'System Settings Updated', 'Completed', NULL, '2026-05-14 15:36:33', '2026-05-14 15:36:33', '2026-05-14 15:36:33'),
(20, 1, NULL, 'Admin Officer', 'ADMIN', 'Global Config', 'System Settings Updated', 'Completed', NULL, '2026-05-15 07:23:13', '2026-05-15 07:23:13', '2026-05-15 07:23:13'),
(21, 1, NULL, 'Admin Officer', 'ADMIN', 'Chat support request', 'Support Ticket Updated', 'Investigating', NULL, '2026-05-15 07:54:05', '2026-05-15 07:54:05', '2026-05-15 07:54:05'),
(22, 1, NULL, 'Admin Officer', 'ADMIN', 'Chat support request', 'Support Ticket Updated', 'Resolved', NULL, '2026-05-15 07:54:09', '2026-05-15 07:54:09', '2026-05-15 07:54:09'),
(23, 1, NULL, 'Admin Officer', 'ADMIN', 'Global Config', 'System Settings Updated', 'Completed', NULL, '2026-05-15 07:57:12', '2026-05-15 07:57:12', '2026-05-15 07:57:12'),
(24, 1, NULL, 'Admin Officer', 'ADMIN', 'Chat support request', 'Support Ticket Updated', 'Resolved', NULL, '2026-05-15 07:57:54', '2026-05-15 07:57:54', '2026-05-15 07:57:54');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2026_05_09_000001_create_users_table', 1),
(2, '2026_05_09_000002_create_api_tokens_table', 1),
(3, '2026_05_09_000003_create_system_settings_table', 1),
(4, '2026_05_09_000004_create_verifications_table', 1),
(5, '2026_05_09_000005_create_transactions_table', 1),
(6, '2026_05_09_000006_create_support_tickets_table', 1),
(7, '2026_05_09_000007_create_audit_logs_table', 1),
(8, '2026_05_10_000008_create_password_reset_tokens_table', 2),
(9, '2026_05_11_000009_create_virtual_account_payment_tables', 3),
(10, '2026_05_13_000010_create_service_requests_table', 4),
(11, '2026_05_13_000011_add_template_pricing_to_system_settings_table', 5),
(12, '2026_05_14_000011_create_services_table', 6),
(13, '2026_05_14_000012_add_guest_reply_fields_to_support_tickets_table', 7);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`email`, `token`, `created_at`) VALUES
('gaddafiumar4445@gmail.com', '$2y$12$7XxNg1Ch/ILIvM7L7jrAmeKZPI5XWi0YzdA43DedWfHPXDXH5rOZe', '2026-05-10 07:35:43'),
('umgaddafi6@gmail.com', '$2y$12$lH7qjx1gHeKp6KeDCQP6VOYV7Ky1UDgLZxxRzU7y5oLvyJ4BsgIpy', '2026-05-11 09:39:00');

-- --------------------------------------------------------

--
-- Table structure for table `paystack_webhook_events`
--

CREATE TABLE `paystack_webhook_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `event` varchar(255) NOT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `account_number` varchar(255) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload`)),
  `processed_at` timestamp NULL DEFAULT NULL,
  `email_sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `paystack_webhook_events`
--

INSERT INTO `paystack_webhook_events` (`id`, `event`, `reference`, `account_number`, `amount`, `payload`, `processed_at`, `email_sent_at`, `created_at`, `updated_at`) VALUES
(1, 'charge.success', '100004260511125814159583710049', '9812903354', 200.00, '{\"event\":\"charge.success\",\"data\":{\"id\":6135070197,\"domain\":\"live\",\"status\":\"success\",\"reference\":\"100004260511125814159583710049\",\"receipt_number\":null,\"amount\":20000,\"message\":null,\"gateway_response\":\"Approved\",\"response_code\":null,\"paid_at\":\"2026-05-11T12:58:23.000Z\",\"created_at\":\"2026-05-11T12:58:23.000Z\",\"channel\":\"dedicated_nuban\",\"currency\":\"NGN\",\"ip_address\":null,\"metadata\":{\"receiver_account_number\":\"9812903354\",\"receiver_bank\":\"Wema Bank\",\"receiver_account_type\":null,\"custom_fields\":[{\"display_name\":\"Receiver Account\",\"variable_name\":\"receiver_account_number\",\"value\":\"9812903354\"},{\"display_name\":\"Receiver Bank\",\"variable_name\":\"receiver_bank\",\"value\":\"Wema Bank\"}]},\"log\":null,\"fees\":200,\"fees_split\":null,\"authorization\":{\"authorization_code\":\"AUTH_zng7a2ko54\",\"bin\":\"904XXX\",\"last4\":\"X091\",\"exp_month\":\"04\",\"exp_year\":\"2026\",\"channel\":\"dedicated_nuban\",\"card_type\":\"transfer\",\"bank\":\"OPay Digital Services Limited (OPay)\",\"country_code\":\"NG\",\"brand\":\"Managed Account\",\"reusable\":false,\"signature\":null,\"account_name\":null,\"sender_bank\":\"OPay Digital Services Limited (OPay)\",\"sender_country\":\"NG\",\"sender_bank_account_number\":\"XXXXXX0091\",\"sender_name\":\"GADDAFI UMAR\",\"narration\":\"9042340091\\/9812903354\\/KENDATINTEGRA\\/M\",\"receiver_bank_account_number\":\"9812903354\",\"receiver_bank\":\"Wema Bank\"},\"customer\":{\"id\":363699599,\"first_name\":\"Shamad\",\"last_name\":\"Mufti\",\"email\":\"umgaddafi1@gmail.com\",\"customer_code\":\"CUS_dnz05uhzrxd4rl4\",\"phone\":\"09042340091\",\"metadata\":{\"user_id\":\"5\",\"member_id\":\"MB-1003\"},\"risk_action\":\"default\",\"international_format_phone\":null},\"plan\":null,\"split\":[],\"order_id\":null,\"paidAt\":\"2026-05-11T12:58:23.000Z\",\"createdAt\":\"2026-05-11T12:58:23.000Z\",\"requested_amount\":20000,\"pos_transaction_data\":null,\"source\":null,\"fees_breakdown\":[{\"amount\":200,\"formula\":null,\"type\":\"paystack\"}],\"connect\":null,\"transaction_date\":\"2026-05-11T12:58:23.000Z\",\"plan_object\":[],\"subaccount\":[]}}', '2026-05-11 12:04:49', '2026-05-11 12:04:54', '2026-05-11 12:04:49', '2026-05-11 12:04:54');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL DEFAULT 'verification',
  `type` varchar(255) DEFAULT NULL,
  `route_path` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` varchar(255) NOT NULL DEFAULT 'Live',
  `image_path` varchar(255) DEFAULT NULL,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `show_on_homepage` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `title`, `slug`, `category`, `type`, `route_path`, `description`, `amount`, `status`, `image_path`, `sort_order`, `show_on_homepage`, `created_at`, `updated_at`) VALUES
(1, 'NIN Verification', 'nin-verification', 'verification', 'nin', '/select_nin_template', 'Verify National Identification Number details with wallet-based processing.', 150.00, 'Live', '/uploads/services/20260514161215-tEsLx0AT.png', 1, 1, '2026-05-14 13:51:14', '2026-05-14 15:12:15'),
(2, 'BVN Verification', 'bvn-verification', 'verification', 'bvn', '/verify_bvn', 'Validate Bank Verification Number details from a dedicated service flow.', 170.00, 'Live', '/uploads/services/20260514161251-celZLV0n.png', 2, 1, '2026-05-14 13:51:14', '2026-05-14 15:12:51'),
(3, 'NIN Modification', 'nin-modification', 'ninModifications', 'name', '/modification/nin', 'Submit NIN update requests.', 8000.00, 'Live', '/uploads/services/20260514161303-QlO1bX9Z.png', 3, 1, '2026-05-14 13:51:14', '2026-05-14 15:13:03'),
(4, 'Birth Attestation', 'birth-attestation', 'birthAttestations', 'permanent', '/birth-attestation', 'Open permanent and temporary birth attestation requests.', 1500.00, 'Live', '/uploads/services/20260514161316-Yayhh0m2.png', 4, 1, '2026-05-14 13:51:14', '2026-05-14 15:13:16'),
(5, 'IPE / Error 50 Resolution', 'ipe-error-50-resolution', 'resolutions', 'tracking', '/ipe-error-50-resolution', 'Submit a tracking ID for IPE, Error 50, or related resolution processing.', 1000.00, 'Live', '/uploads/services/20260514161329-ko8QpyUp.png', 5, 1, '2026-05-14 13:51:14', '2026-05-14 15:13:29'),
(6, 'Diaspora Child Birth Notification', 'diaspora-child-birth-notification', 'diasporaBirth', 'child', '/diaspora-child-birth-notification', 'Parent-linked child identity request for diaspora birth notification.', 2000.00, 'Live', '/uploads/services/20260514161340-Xv3Zq4Mg.png', 6, 1, '2026-05-14 13:51:14', '2026-05-14 15:13:40');

-- --------------------------------------------------------

--
-- Table structure for table `service_requests`
--

CREATE TABLE `service_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `reviewed_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `category` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `reference` varchar(255) NOT NULL,
  `identifier` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` varchar(255) NOT NULL DEFAULT 'New Request',
  `picture_path` varchar(255) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`details`)),
  `submitted_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `service_requests`
--

INSERT INTO `service_requests` (`id`, `user_id`, `reviewed_by_user_id`, `category`, `type`, `reference`, `identifier`, `email`, `amount`, `status`, `picture_path`, `details`, `submitted_at`, `completed_at`, `created_at`, `updated_at`) VALUES
(1, 5, 1, 'ninModifications', 'PHONE NUMBER MODIFICATION', 'NIN-MOD-DFOYAXGPAF', '12345678901', 'umgaddafi1@gmail.com', 1.00, 'Completed', '/uploads/service-requests/20260513002509-gXV8BEt4.jpg', '{\"nin\":\"12345678901\",\"oldPhoneNumber\":\"\",\"newPhoneNumber\":\"09042340091\"}', '2026-05-12 23:25:10', '2026-05-14 14:30:22', '2026-05-12 23:25:10', '2026-05-14 14:30:22');

-- --------------------------------------------------------

--
-- Table structure for table `support_tickets`
--

CREATE TABLE `support_tickets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `assigned_admin_id` bigint(20) UNSIGNED DEFAULT NULL,
  `guest_name` varchar(255) DEFAULT NULL,
  `guest_email` varchar(255) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `channel` varchar(255) NOT NULL,
  `priority` varchar(255) NOT NULL DEFAULT 'Medium',
  `status` varchar(255) NOT NULL DEFAULT 'Open',
  `message` text DEFAULT NULL,
  `admin_reply` text DEFAULT NULL,
  `replied_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `support_tickets`
--

INSERT INTO `support_tickets` (`id`, `user_id`, `assigned_admin_id`, `guest_name`, `guest_email`, `subject`, `channel`, `priority`, `status`, `message`, `admin_reply`, `replied_at`, `created_at`, `updated_at`) VALUES
(1, 2, 1, NULL, NULL, 'BVN response mismatch', 'Verification', 'High', 'Investigating', 'Member reported a mismatch during BVN review.', NULL, NULL, '2026-05-09 20:43:51', '2026-05-09 20:43:51'),
(2, NULL, 1, 'Muhammad Adamu', 'muhdmukhtar2019@gmail.com', 'Chat support request', 'Live Chat', 'Medium', 'Resolved', 'I want to make a modification but system is failing to allow me to generate a repo', 'Your issue has been resolved, login and fund your account', '2026-05-15 07:57:48', '2026-05-15 07:53:27', '2026-05-15 07:57:48');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `branding` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`branding`)),
  `smtp` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`smtp`)),
  `support_email` varchar(255) DEFAULT NULL,
  `support_phone` varchar(255) DEFAULT NULL,
  `default_nin_price` decimal(12,2) NOT NULL DEFAULT 150.00,
  `default_bvn_price` decimal(12,2) NOT NULL DEFAULT 170.00,
  `default_phone_price` decimal(12,2) NOT NULL DEFAULT 200.00,
  `template_pricing` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`template_pricing`)),
  `registration_mode` varchar(255) NOT NULL DEFAULT 'OPEN',
  `auto_debit_date` tinyint(3) UNSIGNED NOT NULL DEFAULT 1,
  `is_auto_debit_active` tinyint(1) NOT NULL DEFAULT 0,
  `total_pool_liquidity` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `branding`, `smtp`, `support_email`, `support_phone`, `default_nin_price`, `default_bvn_price`, `default_phone_price`, `template_pricing`, `registration_mode`, `auto_debit_date`, `is_auto_debit_active`, `total_pool_liquidity`, `created_at`, `updated_at`) VALUES
(1, '{\"systemName\":\"IDM e-Services\",\"logoUrl\":\"http:\\/\\/127.0.0.1:8000\\/uploads\\/branding\\/logo-20260515082313-seGit7qu.png\",\"faviconUrl\":\"http:\\/\\/127.0.0.1:8000\\/uploads\\/branding\\/logo-20260515082313-seGit7qu.png\",\"homepageWallpaperUrl\":\"http:\\/\\/127.0.0.1:8000\\/uploads\\/branding\\/homepage-20260515082313-CJS3dGVK.png\"}', '{\"host\":\"kisltd.com.ng\",\"port\":\"465\",\"user\":\"support@kisltd.com.ng\",\"pass\":\"Kenny@123!\",\"fromName\":\"IDM e-Services\",\"fromEmail\":\"support@kisltd.com.ng\"}', 'support@idmeservices.com.ng', '+2348000000000', 150.00, 170.00, 200.00, '{\"nin\":[{\"id\":\"premium\",\"title\":\"Premium Template\",\"amount\":150,\"status\":\"Live\"},{\"id\":\"regular\",\"title\":\"Regular Template\",\"amount\":150,\"status\":\"Ready\"}],\"phone\":[{\"id\":\"premium-phone\",\"title\":\"Premium\",\"amount\":200,\"status\":\"Live\"},{\"id\":\"regular-phone\",\"title\":\"Regular\",\"amount\":200,\"status\":\"Ready\"},{\"id\":\"standard-phone\",\"title\":\"Standard\",\"amount\":200,\"status\":\"Ready\"}],\"bvn\":[{\"id\":\"premium-bvn\",\"title\":\"Premium\",\"amount\":170,\"status\":\"Live\"},{\"id\":\"regular-bvn\",\"title\":\"Regular\",\"amount\":170,\"status\":\"Ready\"}],\"modification\":[{\"id\":\"dob-modification\",\"title\":\"DOB Modification\",\"amount\":43000,\"status\":\"Live\"},{\"id\":\"phone-modification\",\"title\":\"Phone Number Modification\",\"amount\":1,\"status\":\"Live\"},{\"id\":\"address-modification\",\"title\":\"Address Modification\",\"amount\":8000,\"status\":\"Live\"},{\"id\":\"name-modification\",\"title\":\"Name Modification\",\"amount\":8000,\"status\":\"Live\"}],\"birthAttestation\":[{\"id\":\"permanent-attestation\",\"title\":\"Permanent Birth Attestation\",\"amount\":1500,\"status\":\"Live\"},{\"id\":\"temporary-attestation\",\"title\":\"Temporary Birth Attestation\",\"amount\":1000,\"status\":\"Live\"}],\"diaspora\":[{\"id\":\"diaspora-child-birth\",\"title\":\"Diaspora Child Birth Notification\",\"amount\":2000,\"status\":\"Live\"}],\"resolutions\":[{\"id\":\"ipe-error-50\",\"title\":\"IPE \\/ Error 50 \\/ Resolution\",\"amount\":1000,\"status\":\"Live\"}],\"others\":[{\"id\":\"express-other\",\"title\":\"Express Verification\",\"amount\":250,\"status\":\"Ready\"},{\"id\":\"default-other\",\"title\":\"Default Verification\",\"amount\":180,\"status\":\"Ready\"}]}', 'OPEN', 1, 0, 174000.00, '2026-05-09 20:43:49', '2026-05-15 07:57:12');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `verification_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reference` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `direction` varchar(255) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Completed',
  `description` varchar(255) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `user_id`, `verification_id`, `reference`, `type`, `direction`, `amount`, `status`, `description`, `metadata`, `processed_at`, `created_at`, `updated_at`) VALUES
(1, 2, NULL, 'FUND-62220724837', 'Wallet Funding', 'credit', 49150.00, 'Completed', 'Manual wallet funding approved by admin', NULL, '2026-05-08 07:45:00', '2026-05-09 20:43:50', '2026-05-09 20:43:50'),
(2, 2, 1, 'NIN-0001', 'NIN Verification', 'debit', 150.00, 'Completed', 'NIN verification charge', NULL, '2026-05-08 08:16:00', '2026-05-09 20:43:50', '2026-05-09 20:43:50'),
(3, 2, 3, 'TXN-PK0OI0TYBJ', 'BVN Verification', 'debit', 170.00, 'Completed', 'BVN verification charge', '{\"verificationReference\":\"BVN-SWOMIRR9\"}', '2026-05-09 21:59:45', '2026-05-09 21:59:45', '2026-05-09 21:59:45'),
(4, 5, NULL, '100004260511125814159583710049', 'Wallet Deposit', 'credit', 200.00, 'Completed', 'Wallet funded via dedicated virtual account', '{\"provider\":\"paystack\",\"account_number\":\"9812903354\",\"bank_name\":\"Wema Bank\",\"channel\":\"dedicated_nuban\",\"customer_email\":\"umgaddafi1@gmail.com\"}', '2026-05-11 11:58:23', '2026-05-11 12:04:49', '2026-05-11 12:04:49'),
(5, 5, 4, 'TXN-SU0USA38WF', 'NIN Verification', 'debit', 150.00, 'Completed', 'NIN verification charge', '{\"verificationReference\":\"NIN-KCXQFTJR\"}', '2026-05-11 12:37:44', '2026-05-11 12:37:44', '2026-05-11 12:37:44'),
(6, 5, NULL, 'TXN-CZPJEAJLPX', 'PHONE NUMBER MODIFICATION', 'debit', 1.00, 'Completed', 'PHONE NUMBER MODIFICATION charge', '{\"serviceRequestReference\":\"NIN-MOD-DFOYAXGPAF\",\"category\":\"ninModifications\"}', '2026-05-12 23:25:10', '2026-05-12 23:25:10', '2026-05-12 23:25:10');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `nin` varchar(11) DEFAULT NULL,
  `bvn` varchar(11) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'MEMBER',
  `member_id` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Active',
  `wallet_balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_savings` decimal(12,2) NOT NULL DEFAULT 0.00,
  `join_date` date DEFAULT NULL,
  `wallet_label` varchar(255) DEFAULT NULL,
  `wallet_reference` varchar(255) DEFAULT NULL,
  `funding_note` text DEFAULT NULL,
  `paystack_customer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `paystack_customer_code` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `nin`, `bvn`, `password`, `role`, `member_id`, `status`, `wallet_balance`, `total_savings`, `join_date`, `wallet_label`, `wallet_reference`, `funding_note`, `paystack_customer_id`, `paystack_customer_code`, `created_at`, `updated_at`) VALUES
(1, 'Admin Officer', 'admin@idmeservices.com.ng', '08000000000', NULL, NULL, '$2y$12$P2DCo7JMWshInexm3a/UDe8cH/mv0OEy8CSfapRhUYxXySZlH8Kvy', 'ADMIN', 'ADM-0001', 'Active', 125000.00, 0.00, '2026-01-02', 'Admin Wallet', 'NINV-ADM-0001', 'Use this wallet reference when logging internal treasury adjustments.', 364615840, 'CUS_ycl04uov2s40am9', '2026-05-09 20:43:49', '2026-05-14 13:37:16'),
(2, 'Gaddafi Umar', 'um@gmail.com', '09042340091', '12345678901', '22240458089', '$2y$12$uLuLDpVu21JuWjThDShxh.yvpqdapo2dsHaHbFr30JYLz1LkIPcpu', 'MEMBER', 'MB-1000', 'Active', 48830.00, 4800.00, '2025-12-19', 'Primary Wallet', 'NINV-MB-1000', 'Share this reference when requesting a wallet funding review.', 363698111, 'CUS_vwp0385idwyiaeb', '2026-05-09 20:43:49', '2026-05-11 11:41:34'),
(3, 'Shamad Mufti', 'umgaddafi6@gmail.com', '09042340091', NULL, NULL, '$2y$12$uYL2bKKavuRvWiX3WH01VeL5HVko8hSxzR97NC4t7iKL8J/cJn0Qy', 'MEMBER', 'MB-1001', 'Active', 0.00, 0.00, '2026-05-09', 'Primary Wallet', 'NINV-MB-1001', 'Use this wallet reference when requesting a manual balance update.', 363698117, 'CUS_mk4nc420wia0wg7', '2026-05-09 22:21:43', '2026-05-11 11:41:36'),
(4, 'GADDAFI UMAR', 'gaddafiumar4445@gmail.com', '09042340091', NULL, NULL, '$2y$12$yrHROQLWOBw2SHLotsYCzud9dIYSw/zi3hvpsoAq1xfKzwJGNEpve', 'MEMBER', 'MB-1002', 'Active', 0.00, 0.00, '2026-05-10', 'Primary Wallet', 'NINV-MB-1002', 'Use this wallet reference when requesting a manual balance update.', 363698128, 'CUS_jcpfnw2qiod26hg', '2026-05-10 07:32:05', '2026-05-11 11:41:37'),
(5, 'Shamad Mufti', 'umgaddafi1@gmail.com', '09042340091', '53449684354', NULL, '$2y$12$fI9mB22FtEWYBBrilG6xXOcm76L1VSVlZ3GCUxPxVpFz2ILZgrHgG', 'MEMBER', 'MB-1003', 'Active', 49.00, 0.00, '2026-05-11', 'Primary Wallet', 'NINV-MB-1003', 'Use this wallet reference when requesting a manual balance update.', 363699599, 'CUS_dnz05uhzrxd4rl4', '2026-05-11 11:47:07', '2026-05-12 23:25:10'),
(6, 'kehinde adefemi', 'accestoreng@gmail.com', '07038367322', NULL, NULL, '$2y$12$1P3r3YvlCVHvddnje9GpJO3npIpucmyoZR8UxsJaHN1pYRQhKkita', 'MEMBER', 'MB-1004', 'Active', 0.00, 0.00, '2026-05-11', 'Primary Wallet', 'NINV-MB-1004', 'Use this wallet reference when requesting a manual balance update.', 363715776, 'CUS_4zz3k7w5a3athet', '2026-05-11 12:44:57', '2026-05-11 12:44:58'),
(7, 'Smoke Test', 'smoke1778587227@example.com', '08012345678', NULL, NULL, '$2y$12$l5tGG4K0T5Yqlj8vJXTTVOyjKSd8E5DIX0OGqMnwWQ/I5dlys/YEi', 'MEMBER', 'MB-1005', 'Active', 0.00, 0.00, '2026-05-12', 'Primary Wallet', 'NINV-MB-1005', 'Use this wallet reference when requesting a manual balance update.', 363963044, 'CUS_x37ky9tly04wiqb', '2026-05-12 11:00:29', '2026-05-12 11:00:32');

-- --------------------------------------------------------

--
-- Table structure for table `verifications`
--

CREATE TABLE `verifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `reviewed_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reference` varchar(255) NOT NULL,
  `channel` varchar(255) NOT NULL,
  `identifier` varchar(255) NOT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` varchar(255) NOT NULL DEFAULT 'Pending Review',
  `result` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`result`)),
  `requested_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `verifications`
--

INSERT INTO `verifications` (`id`, `user_id`, `reviewed_by_user_id`, `reference`, `channel`, `identifier`, `amount`, `status`, `result`, `requested_at`, `completed_at`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 'NIN-0001', 'NIN Verification', '12345678901', 150.00, 'Completed', '{\"nin\":\"12345678901\",\"surname\":\"UMAR\",\"firstName\":\"GADDAFI\",\"middleName\":\"\",\"givenNames\":\"GADDAFI\",\"dateOfBirth\":\"1998-12-27\",\"sex\":\"M\",\"gender\":\"Male\",\"issueDate\":\"2025-11-17\",\"trackingId\":\"S2N6NVERAB0AX4\",\"addressLines\":[\"BACHURE VILLAGE JIMETA\",\"Yola North\",\"Adamawa\"],\"nationalityCode\":\"NGA\"}', '2026-05-08 08:15:00', '2026-05-08 08:16:00', '2026-05-09 20:43:50', '2026-05-09 20:43:50'),
(2, 2, 1, 'BVN-0008', 'BVN Verification', '12345678901', 170.00, 'Pending Review', NULL, '2026-05-08 09:05:00', NULL, '2026-05-09 20:43:50', '2026-05-09 20:43:50'),
(3, 2, NULL, 'BVN-SWOMIRR9', 'BVN Verification', '22240458089', 170.00, 'Completed', '{\"bvn\":\"22240458089\",\"firstName\":\"GADDAFI\",\"middleName\":\"\",\"lastName\":\"UMAR\",\"phoneNumber\":\"09035067771\",\"dateOfBirth\":\"1998-12-27\",\"gender\":\"Male\",\"address\":\"\",\"addressLines\":[\"\",\"\",\"\"],\"passportPhoto\":\"data:image\\/jpeg;base64,\\/9j\\/4AAQSkZJRgABAgAAAQABAAD\\/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL\\/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL\\/wAARCAGQASwDASIAAhEBAxEB\\/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL\\/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6\\/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL\\/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6\\/9oADAMBAAIRAxEAPwDZzRRgUoxWQxKM0UcUANMiA8sBTfMVuFYH6U\\/iggGgBvmqo+Y4pfOQjIYYpo+VsU\\/AoAUOuevNLmkFFAC5zRkUlLxQAZFG4UlAxQAO6r94037REP4+Kf0NHegCvLNG2ArAmpEnRV5OKJhlD7UkJ+Sq6C6kgnQ8g0vmqRnPFJxS0hiiQEcHil3imjFLxQAvmCjzB70YGadxTAQSD3pDKPQ04AUYFGghnnDH3T+VBkzxgin4oMRbJA4A5prcCNXwT8pP0FPEgPZh9RTgMClxQwG7\\/Y07d7GnBOKULzRYBu72ozUmwgdKQofSiwDNxo3n0oIxSUMBC7f3TRvb+6aWikBT3n0xTgx9KTcKAwqRign0o3H0pC1JuoAUuw\\/hpvmNjhadupN1ADHMhxhB+dCSvyNtO3VG7bTkUDJBI5\\/hpwdvSo1cEdacXA70CHhjjpRuPpTAwx1oLA0AP3H0oDH0pm6lDCmA\\/caaXfqE\\/WkLijzAO9AAzuV+4R+IqKF5OQEyB709pFx94fnUUMgDkZpoCYySZ4hP\\/fQpfMk\\/55H8xR5q56il8xfWgBQ7\\/wBwj8acGJ6jFJvX1qOVyOhxQBPk+lLk+lVElJ\\/jBP1qyrdzSQMeC2OlJuajeKQyAd6oBxZvQYqMXTDegxkAEj1oklUL15pLCWxBne6LhsjaAOvFNCA3Eo6Rg\\/jV7TrW+1BsW9qzgdSOgqut3bPkJG+e2RXpvh+OBNFtvI24KAtj170JCucoPC+qbcmFPpvFTweFr9mAkWONe5LZrt6a7rGu52Cj1JqgMOLwrZKgEjys3cg4qT\\/hFtN9Jf8AvutJb+0dtq3EZPpuqVpokUs0iBR3LUWBWOS1rwzbWtmZ7WSQMCBtY5BrmWs5gT0xXWat4itJH8mJg6r39TVPS9QsZLsm5KJGoLHd0otcTl2OcuLZreya6lk2Io7jrWbFPPLGH2hc9iOava9q39v6lmNNlhCcRr\\/fP941ArIowKhpFIhBB5oyM1WaBVfcKVTGRx27VNhksrMI2KAFscA1jLrM+7EkUY5xxmtj5SMZrMvdKS4kMkT7HPX0NACx6wN48xQF7kVpo4ddwPBrAXRJ1cH7UgUdRtJJrcjRY4woPakBJSEAikJHrSHHrRYBi4RsHpUhCnrioXRSODio0Zc7WPNMZb+UUcVD2xSBhjrQInyKXiq+7PejPvTAnyKML6CoN2e9GfegCbbH\\/dX8qi+VZ+AKbn3qFtpcbuhoQF75PRfypRt9BUCrGB0pQEyaYFgYHanEK3XFQhl9aNy+ooEOWCBDkRpn12jNTAiq\\/mRj+IfnS+bHj7wx9adgLGRRhfQZqqbqALkyLj3NC3EDkBXDE9ADQBZKqewp64qNQNvFTwxmZwkalmPQKMmgBVwDkVoWupXFqu2Kd0Hop4oXRNRYZFlN\\/wB8GlfRr+Jdz2kwHrsNMRZ\\/t69HIupc\\/Wq1xqtxc\\/66d3HoTVZ7aRc5Rh9RVWRghwTQBc+1kd6Gu3YYLEj0JrNNxH\\/fH501rmNPvMB75o5mFkWnlGT0qvJJ5nyDGO9QGQTH5T8nrUihAMDtSGSKFVQAMYp2RUe5RRvFSNFvxNc2H9syPpyhoj97aON3tWNPPa3EW\\/7NLDcjo6DhvrWK2tE\\/wH6UxtYOPu03IFBmtHcnb+8Qg1KJ1I4rnzq7t\\/CPzqP+03HbFTuVynTeaKXzRXMf2tIOoyKlhv7m4jmMSpmMAjcetIGjofNFJ5orlF1yZow5VRkZ61S1DWbue3KRSGFT1Zepqoq4mrHQar4o07SspJIZZ+0UfJrjtQ8YajeORFstI+wUbm\\/Emsh4wGJ7nkk9TVZ15zWiikTuaKavfb9326cn3bitvT\\/FGoQnErLcR+jqAfzrk0GK0bQqxANWrPRktNbHotlrVreqNpKP3RuorQ381zuk6baXaqXLK54BAya0ryyv9LiaVN9xbqO6ncv19qcqL3iRGsr2kaBajzOa55dZZlztB+ho\\/thx1QfnXP6nQlfY6HeAemajmLLGJPJkCf3tvFYY1pu8Z61p2PiK7bzLcSosSoGKuoI5OKqEeZ2Im+VXZaWf5QQjEY7CnibgfKea53\\/hIGbdth24YjAOBkHFMbxA68iLPtmiXuuw46q51Cv\\/ALJH1qTII964qXxZNCM+QPpu\\/wDrVSbx5dqcfZoSP985\\/lSWo2j0IEZ6UuR6V5wfHepHpbwKOwJPNR\\/8Jzq7qGEUGD0wpGKepJ6ZkdcVBJO7ShIyNw5wTXnZ8bauR8qQk\\/Q1Gvi\\/V\\/M3RiBWPU7Sf0p2YHrMEyBVVkHA59zXV+Er3ToLudpdsTkDazV8\\/wD\\/AAmOtYwrQE+pQj+tPXxlrX8MkWc8jZ\\/9ehLUR9VjWdNZtovYs\\/WriSRyKGR1YHuDXygvjLWFHM8RHp5eP61et\\/HGtoABdqnsMj+tUkGp9RHaR823HvXG+Mp9LZIrXEZnLbmaMDKivHB401qVQHvCR7Mf8agk1+9Yks4Ynvjmk9Bq7O9mTQYLdnCzPIBkLtA5+tc7HE80xnlACZyiZ6fWuZn1e7dc7hVf+2r0nmYgew60rj5TvRMAOwoM49a4ddVu5MASY9cVL9suj\\/y3f9KkrlZ2D3kcYy7gCo\\/7Sg\\/56j9azdEkNxHIsrF5ByC3pVZ7eYzzDcwAcgcnpS1FYzivPSjbntVgx5PSlEeO1SaIqlOaQpVox8dKaUoGVimBV\\/TFCwXTDsv9KqsnFWEcQ6PeODjJEY+p4pxV2TLRCaJ4be\\/hW6u90dqF\\/doOC2O5qt4gsre1GIugrbTxAo06KA\\/KYxt46YFcbrOqC7nKq2Vzziu5RjGNjivKU7mLMSWNQFSe1XyqMvvURSslDU3uV1QntU8UbowYdqlVQKm3oEwBzWvs0S5M7j4d6xaQ6l5V4ACFBG7619Dolle2ynyopI5E\\/ujkGvjf7RJb3KzwsUkXoR6V6d4M+JlxbWRsrhl\\/djKZ9PahpTSV9UYNOEnK2jLnxC8KR6BrAuLFcWlxzs\\/un2rjCBmup1vxXJ4lklSfKxAfulz0PrXMsBuIA47VhXhazOnDzbumMxT7WeFb+eOZlUG2ByeM7eaQCobsFVR1txLzgnHINRRk09DWcFKybsQwfvIPMx99mbH1JpJFxVxoWhVEdQuVD4Ax1qvIoqZyblcaiorlRc8P6da31\\/KLmFJVWHIVh3zXQ\\/8ACMaKc\\/8AErtuf9mszwov+n3HB4hHP\\/Aq60LQkQ3qYR8IaCeumQ0f8IdoP\\/QNi\\/Wt\\/Y3bFOEcntn6UyTAHgzQM5\\/syL8zT18GaBnnTIcfjW+kMp6lfyqVYZFxl0H1oFc55fBOhHppcX61MvgjQ\\/8AoGRfrXX6dZea2JZQq+oXNbLWkWlTRyRXCTyHkLs4A96qwrnnB8H6Ko406HA6ZFOHhbR16abB\\/wB812d5G1xcNL5cabuoQYzVY2h9KLBc5N\\/DelKvy6fCM+griI0yhHozAfQE165LbEDOO9eWxwkNIMdJH\\/8AQjUvQuDbKjxlsKB1OKrSQWsNzJC9zN5iNtYCLIH41pSRsGGOMEGi+0CWa+muIZowkr78MDmhajk2tUV44UVFeN2ZWJA3DHSpgKe0BtooLdmy4ZnOPTin4pMqLursbHNLCcxuyNjGVODS\\/a7j\\/nvIT3JbrSFabs96mwzUKc8ilCGrATml2AU7CKxSmFATyKtmPimFDSYymyY6Cob\\/ADF4fmk6j7THwPrV1kOaZqcRbwjft\\/cdX\\/I5px3FPY5Ka4aYELkdjWayMHOaviWO1t2kODIeFHp71ltfFScjcTXQ3oYJak5JWmGXIqAXoYcqRQJFfpUNlpE4lPrUiBn6GqhYDqaT7cIxgVcZdxNFqWFwCT2qG3dopcgZ9RUX9oNINueKltZF84F1JGecUN6itoblpdhyOuRWruBUGsBfLt34bI6j1pZr6SRdoJAonFyVhRfK7o1pb2KL7zc+1VxrZiYtGn51i4Z2LEH61KEOORSUEinKTNCbWJZnLOO3FR\\/b2bg1V8o7enFIIyxxjFWool3NO01y90+UvaGIMwwTIpPFbdt46u1wLmyhf3ifH6H\\/ABrlUt2znOakNqzj5Tj8M0cqfQV2eh2PjLSbniZ2tm\\/6ajj862F1fTzjFwCOuVRiP5V5G0EqLkLvx6VcsNYu9PKmI8gcxk9R6VLp9gUn1PVk1rTR\\/wAtj\\/37b\\/Cp01fTHOS5bH\\/TJj\\/SuJs\\/FweP95aRK\\/uOv5VaHizjK28A+qn\\/AArNpx3KVnsdxFr+mxjiRgB\\/0zPFWV1\\/TGIJmb\\/v2a4EeMCP+XeA\\/wDAT\\/hTx4028eRAM\\/7B\\/wAKLhynfnW9LP8Ay8gfVSP6U4ahYSY2XMZz7158PGxOR5MB\\/wC2bf4VIvjSMECaBSv\\/AEziJ\\/pRcOQ72TyiPvL9M15KT+\\/kAAIMjc\\/8CNdFL41shHlY7gk9MRmsOyMW1RL+7LsSC3QEnvSkVFWI5Il281onUYI4odwOX4wB+FMlsmJ+dlVex3Dmq0yLHNnGWUBY17\\/U+g\\/wpJ2KauRXwEuogjoilT7kkf4VGUGKnCBevU9T6mkYD1qXcrZFYpxTdtWCtNwKEO5EviewYgB2P0WtizuY7yMSR5Kn1FcVDp0Ui7i7J6YNdf4dtXhsirsX+Y7SeuK6atKMVoc8Kjky\\/s9qYyDHSrpTFRMnNcxsUWTJwBznFczP4tDC+0n7GHt3zG7F9rA11rp6V53qMCW3ii6jZf8AWOJPzpx3Bozb2Uk\\/Ljb2qFGJj4HNXdTtWEpYDCsflHtVFQ0YIIwa0ZAp80cHGPcUkSySk\\/MiEevSmsXxnJNQiMytszx1NGgFgoVY5kVselROHHIUce1DwmDBBOD1qe2ieY8nEY6mq9BENt50zYWNTjuy5ArWQCNRlU392VAv8qmijCRhY1wo7f41KIGdwGXginqIq4LknrU0dsZR0rRhsQxAZMCr0dqicgU2xozI7D5RlTinmyH0Fah4HpULHJpJjKBtwoxihLbeeFq7gDkinxkDpWkRS8itHZkVpWtgqt6nHeljx1q\\/F0HH5VZiyodMjyzFNoPf3rNvNIKjzEjEmOSucEiurjO8bSo470hTBPHFJiucHII0kGxnCk8Bu3tU0E+18SDcvf2rop9OhZ3OxcN1yK5y+sXjuSUXKdiO1JpNDi2maIhgdcoWGfQ5qGW3mVS0ZWQD8DVaB54zyBs+tWPtab1CybJiPlB6N7VCSidcHGpo9GRDzyOLeT8BmgyXFuwJhJz6itCC6k2rPZSBXPDIw4J9D6VfttQtNQVlmVopl4eN8cH1rRSh1RM8LVteLMAajMGyYYwQeymrl94iRpRHZWsEkQjXcZYzjf3AAIqzc2OC3lDenUEelZksBGeK3VCnKzRxSqVIaSRBJrl9t2xLDbjuIYwP1OTUSavdRj5QCT1Lck0rx47VAyc1bw8OxCrskfWr7r8g\\/Cmxazds+CAee1V5F5psagSDtUSowtsXGrI7OAmSBWI5Ip3l06yXNpGfVRUpTmvLe53x2OXga+Rv3BgGOpd8V2+iee9mDPt3d9pyPwNYEWnxI4IYge+Sf510WmXMKxGLzAGHrxmuytUjKNkctOLUtS+V9qidKsg5GajcVxHSVGWuO8Y6dLBeWOqxRlo2zDIQOh7Gu2Zabrdotx4FnDHDK25WHY5qorUmT0PKbm7LMFPIFVJCG+bBp9ymyZlPaolYrz6VVxDWAZgmOTV23t7ZEYF8N2x3qigL7mz8xpqRTqxO\\/P1oQzUnjtpLdFTBcEhxVqysC0a8FVHQHvVWyjYyDd04rprKHKE9Seme1aIllWGy28sOBWitkEG7AJ7egqysA2q2eR29amCZqrCKiwhR70jrwQBV9YQ3NPfT9\\/qPfPFS9EUjDfrg1FIABkHNXp7J0LA84PBqnJEV4YUJ2HuRbuKVQc9aYwxSFyKtNCaL0L8gE8VoW8qK5Vjj0NYaSkGrMcxDqc8d60TRnKNzoo\\/m4Bq5HGWUjIKgVjWcxa4RzuKLkkDvxWpGYwweNsr1HtTaRlqQzw9azLiGNAS65HpWzI29Sc1lXTA5FQCMae12qzxk\\/N0VqzJoI5ISr556r6H1BrcBUsd2aoXUIbpwaRaujBilntp3SRy8bjBboc9j9avx3rnazHdIBjd3NQXKKG2MMg\\/pVi2tTgYGc9KSS6mrrzS0Zcj1GZXBViBWpbSxahhXLNIcAYqR\\/Dki2IuC0YQL87M2AKxBvtpBJBLtkQ5VlNNrld0yfbTqR5ZGhe6PPExZAXT0xyKx5V2sQRgjqK6OHxpa70trm1xO3VlHyk1JqdtZag6NANsjr1Xkj610U8S37szmnQtrE42QHsKSLiQfWrFzGYZTGxBI7joaZEFzya6XqtDJaHZadzZR\\/SrGyoNLXNkmDmrhGDXiT+JnqR2KrxZZTjpTnhXI4FTGNjQ8bYBquhHNdmhp2RAASfxq0w4rOijnWFGiwQTjmtQW87Rg4BP1qGUmVyKnvl\\/4opx2LAf+PCmG2uP+eY\\/76FWtRtpG8KC3GPMLrj\\/voU4ikeO+IbYWut3MSjanDJ9CKyevFdb43spIL63u3XCyp5ZPbcDn+tcqBgmn0AWPjtU8a7jgDk8VVKl+NxX6VsabagFSTnnvVwEy1Z2pUfNzXQ2abYhuA9KrQQfvcr0q6oCj39KvqSydsYBp0Yyai3A9alRsGncEicfKQKsjDYBqrkk1IC22obKQ25iO44Hy1jXagkZ5Nas1y6IwI69KyZGTaTuO41Boig6bWqKrrx7YgzYBPaqkmBwOtNSE0hPcU5ZDxxxUK804ghhnpVqRDRpWlzsbOTWitwdoIIP44rnUJDcHFWEkdeM1al3M5RubD3e3vVKW53Eiq3mZ4z1qMyJuIDBiOpFO5FrD2kyc1HLyKjkbvTBKcYNQ2Wilcxgsak0+YbgjE5U8c4\\/XmlmXfzVSICK5BfdsJwxHYVUQemp3Df8AEy0sIZwVHPlrGzc\\/UY\\/lXJ3QaCQx+ntXZp8L59Ss\\/tGna0wBGfLkXAP5VzOp+Gta0ZWF9YymJB\\/rogXXH9KmbuKDXQwAC2oQssTySBsqqjqa6iFzp7LbySLLqNyfnVOkY9KwYr6OO3eOzMhvmYbWQfLj3PamwX1tpRdoibrUZeHuG5CZ7L\\/jTjLQppmlrKotxHDEowict6kms5EYOKkmmMyRseW2\\/MfU1GpYyD5sV6FNS5Djk1zHaaOP9ATjp1q8RWdHImneHlumlUscAJ3YntWNL4mulfH2WvJmnzM9CD0OuAzTZuAKkUd6gnbNIkvRnFrF2ya17Vt0QrGU4s4ueSa0rKTtWb3K6Fxhx0p19\\/yCo8d3UfrQ1Z3i\\/UW0zwf9pQ4l8xRHn1JrSnFylZESdtTnfG8+nHw7c2tzcRpc8NCuctuFeW5PU9SOailme41jfMzSsHyzOck1JIuSSK1nTUNEKMr6jogWmAxxXTWCfKD6VzdkSZOQciuqs\\/uKOgqFoUa1udq1Ip5qKNgB1qVTk8dau4WJFXualXGajB9aeuBQwLCkZGe9THaF6c1XTDN1qRztCgAnPcdqkpFe4+bIHXtWa6GLJGGfrkjoav3LeWAfWsu4k3gjeQO5HeoZaK7FktjuJkkzjce3OaqO+F9asytkcDiqR+8e1Fx2HJJ7VKGLjFRKBkY\\/GrMeM1SdjNojVWzhvzqcI2PX61KqqafgVadyGV2RifSoymBx1qyRnOKhbI7VZDK7njGKrMxBqxJ9MVWZetSxodu3LjvVeZSVK+tTDIFMdwFPrRsOxch+I\\/iTQrSOzt5LcRgYEjR7mp8fxV8TTArLdWsqnqj24wfyrm9Ri8yLpnFY5UryKUtwSVjc3faNQlvF8u3eVstHCMIPoD0rSj0WK3\\/fufMLDIweMVzdtOQRnrW\\/p962wws2UPQE9DW2HcebVEVXLl0JmAHGAPTFMDYbOBxT3ByaWDKSBsAketejPRM4oP3tS1p19At7+\\/BG0ZUOuce4zTbzUImuWMdvlfUnrUb3jNP506K74wAOg9qz5ZcyEsAM9uleK23setyrc9LZwBjNV5GGRVC71S2tjgzq7DqqckVmSeIC3MVqzf7zhf6Gt6eFqzV0jllXhF2bOx3f6JD9au2sgBFcB\\/wkuo+Usa21sFGcbmJP6YqtL4h1txhbuOEf9M4hn8zmtP7Nqt9CPrlLuesPKiqCzKPqa5P4h6lbzaJY2MUySSebuZVOcAA8\\/nXAXF1ezMXnvp5SfVsfypiKBATkkk8knJrpo4BU2pNmNTFqSskc+26K\\/LHv0q7u3c028h8w5XgjpUUbkcHr3Fc+KpOErrZnTRmpRL1sBvHODXRWrNgDGMVzdu2JEPXJFdNAvAxXEzdGhAcrVpSEXf1qtH8iAtUiTM7nIG0CqiDIW1Bi+FjbHripYL8ZO5Tn+VRyTb32QISe+BWVfXHkPyrb27heKG9RpG+165blcA+tKdUWFSHILEcD1rkJNXk3BSSAO3rUR1OSX75OKlsqx0V9f+a6HdwucCoBLvFYJumYAbiR71YiuMEfMakpdjWZ8JzVKQox5pr3W5cCqxk55NCKt3LqSc8Dip1krLE5z14qTzwvei5NtDXSXPtT95PesL7dj+KmtqbD+LitIsykjoVkjzhpAKlxGeAwP0rlEvFLlzgse9XI9QAI561omZuLNOdFB5NVXUYzmojO0z4HIxRtccUmNDS+B7VAxyTUkhxxUWKm\\/QoguBmIg1jyDJNal0xCmsyQ56DNDegIgHysMVp2kmHU+9ZxQkjrnPQDNbWn6bPKQ7RMsY5JYVpTpyk9DOpNRWpvLAJFUrzkUNYFeSMU9L02kZVLdZW6As2MU7+27uVh50aIF6BR\\/wDWr0XfY4Vbcdp\\/hXUtXulisl3knkkdB716LZ\\/CXT1tUF9eM1xj59vSt\\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\\/jQnbUTVzufCy2FuHsrCRp1Ub9jcsP8AGt\\/UNaVbSRk+aWRfLBJwE7dK8w+Hep+X4oti7AeYpj6\\/lXr+s+Dl1qA3VgwjvVySnaT\\/AOvXPVw3P7y3OqhiYqShV27nD6hqEc8ixoyMqDBfuTWdJchQSDUV2kllO9tcxmKZDhkYYNZF3fKikZqoQ5I2PoIOCj7uxPfag23y1PzNU+jXsltcoysQQRXPicSMWJ5q5azbZVwad7sUpKSaPYI9eeaFfNjVgRwwPNTDVAVHB4FcvpKtPZpIc9xWxHGQgFbptrc+XqxUZtI8hHakkcAUFgq5NVWcytgV9O5WPCjG7uPB3GrCqBTY4woGetSnpQl3FKXRDaQ07tSUyRF6itu1iWEazdbfnW3iQfTkk\\/qKxlGXA966Df5V66Fd0UkYWRfUEda8vM37iR6OX\\/Ezn9CcHWJGPOYSAfxroGcCsaysfsGrysj7otrKv0NaEkh9eK8PbQ9h6suR3G3vir1vqDI3A3Z7VhB896vW0kanDDP0ppg0joIku75QGURx+ver0NnBDtUDLYyWI\\/Sqdrfr5YAY4x0p7XzfNjAX171Rm10NFGiXnHHTFRXN2kUXAyB6VizXxDh2ZVUD15NUZrp7h+GO30Bppisa32oyPkfd96bJMS3y1R\\/eiMLEhJNXLK1llw0oKY6itLk26kElwGBRsgjqaqwyMLlWU8BufetS9sHC+asZK9CfSsVGEc\\/tmknZ6lpe7odXqNmt3pZljQbsZ2153dx7GKjtxzXoNpfhtP8ALYdBgYriL5d91JjoGIpzMYrUyojtlHauhhCzRKB6VztyphkBPStLT7vK43YxUxfQbRbnsePlHNVVGxiD+IrR+0ZI5qrewicebbviQDkdjVNXEm+pIsoC1VupVqg1zKg2yHDetQvOWPJqGyrEuQTxUt+qyeH7mN+nyn9arxHmpdQP\\/Es2jgu6rSTBrUwNMdrHWrWRWI8uRXyOwzzX0z4a8TaXqKj7PqFuzYHy+YAR+Br570vS5b\\/xTZWq5AYZbB6D1r2zQ\\/CWj2dyJ1t90nqxzW0E7GFW19ToPFHhLTPF1mfMPkXij93cx\\/19a+d\\/FXhrWfC1+YNUhJiJ\\/d3Kco\\/49q+nopkjiAAwAMAU27sbLW9PktNQt457eQco4zRKCY6OJnT0T0Pk2LOBV+15kXOcZrqfHHw9m8IzNeWO+fSXbHPLQH0PtXPafHukwe4rnatoe7h6qqQ5ker+HdHmfQoJ8gK4JHr1NaY06bGBg1b0O4+zeH7KMqNohUnPuM1O1\\/GWytvIR6gV12ijwZylKbZ85SyF2wtWLeIKMmq1uAXye1Xgc9K9+Gup5dTRWQ6l5pBThWhgNNJml70lAxK63T\\/IuIUc4acoFJPtXJ8Cp7W+khyEYrjoa5MZRdWHu7o6sLV5J67HST2CoGk24PrWPNwTVaXWL64nhhLZTcN5HpVq4HzV89VhKPxKx7cJJ6p3K+\\/HSrEL4IyTVRutPWQoMAZz39KyizVmzDKx4Xr7mpHuZAuMgD0rPhm9Km5c4PWrIGSy7mLSFiAOFFMikWKRHDMp\\/iXtV2C2Zj8qjPvSXekSiFpF++Oi460egX7l+21y1iTDKMjuaS78W7FCxRqfwrz+81F4ZXjIKyLwVNUxqE7HJHH1pXlYf7tM9GPjF5LR7doAhYY3q2f0rFfVIg2dpxWBFdq69eabJPuyM0tS+aNtDpV8TNHbtHGOTxnHSqUeoeZIC\\/TNc+84QetEd6Djn86u7sYO1zo70x3ER28HHFZ1tK0b1HDcGQBQetWWtiqhyDz6VSIdkX45xjNSmYYyDWUjlTtNSNINpAOKdwsOuWWTINUCCOhp8kg6ZqIsc1LBFq3OWq7cRRvBGZZAiI2\\/6mqVtksMVuNpaXdmhY\\/MpyAe4qooUmR6RdfZWGqKo3xsNvuM4r2zTWEscUo4V1D\\/AJ15NpmkSak0VjEgVTzK3ZV\\/yK9fsIkhgSNfuooUfQVvE5ajux9zLhdopItTKIFJ+cnAqpczjBOeM4rMgnMk7yDoDtXP60MSR1EscWp2c1pOiyRSoVZWGQa8J1zw5c+Fdee0b\\/j2ky1tJn+H0PuK9tsbyOEEu3OPzrC+IGmDV\\/DT3MSA3FofNjPqB1FRUgmrnTg67pVF2Z5do3xLn0p1stQtDNDCdglRvmA9x3r0Wy8feHry1SYaokeeqyDBFeA6gQNSuCv3S2R+IBqHap5Kr+VTCTWpdeC52vM1IBxnFXFHFRI0cSAcVIJA3SvpFZdTwpttj6Sk3UtXci1goopCcChAMc5OKXhVpvVqSTpii5Vug61b9+px3rZnOeRWHEdjA4\\/KttuYVPtXkZnFcsZHpYJ+80VGIz70gJpX60zvXjHqJlmI4+talpFvIJPNZEJ5ratWVVGTzVok2rRUjALCp3beGwRzWULsDvT1vOetUiWUNa8M2errvc+TcLwsqjqPQ+tcrP4OvoT\\/AK+J07EAiu6ednxtFQypKIySpKjrimyEjzibS7u0f5irD1Wq7eYDjaQa6y9gP2jcc7T2qrJBE3G0ZqLl8vY5kpN1KkinJazysNqEZ9a3FgZTgDjNWraLc+SOBWiRk7ok0TR1iUST8titO5VBGVAFAnCIFz0GKjeRX71pokRa71Mm4Xa3pVdn6ir9wFINZb8Gs2Whp5NAGTim81IgqRly1wrA9q0V8SKyLbwR5IOAarWSDOSARU0NnbWzs8cYBJznrV3shWud54PPl2M80jZldwD7DFbz6uIcx78buOK5TQJClmzfws5A\\/AClupC17gnGelXF6HPO1zqLi6DWoZWyuKdZYCAHoB\\/+usQSFEigB+VfmcmtRHW3tXmY8sMj2FUiS5k3N2lvGcDO5z6Ct0TRNA0UpAiI289xXLafqEEDbCd88vLBeSB2FZevajcahfrZQSbVHBCnAFO41HqeQ+JbJtO8UajaH7scuUPqpHH6VmDpXX\\/Emx+ya\\/ZygkiW0AJPcqSP5Yrj6xWmh0N31ZpW4MjZarmMdKbDEFXFSYGK+ghBrc8ick3oAIHU0\\/cD0pm0etOCgVsZOwuc01jSlgO9R\\/eNAJCgEmgrmlWnAc1SYNiKm09a1om326+1ZlXbNwUKVxZhDmou3Q6cHPlq69RJBzURFWJFGagI54r5w9y46PhqvLNtXrVEcDNRSzFVzmmmBpm6APNTQXMZO+SQKo71ylxeuuWOcCqw1YEbcnHvVkux3LeIIUcJbRmQj+JhgU2fV7qQZLqo9AK4+HUo0OC4BqZ9SBGNwx9aTdykl0Nt71m++Q2arPcxg8KM1jfbst1oNzuPBpWHc2kuVxygxVhb20IwQUPriufW7KjFI1xv61adjGSRtTyD7ytke1VftPPFZwuyBjdxTVnG7Oad7k2saplLiqMo+alSQmnP8w6UtwIVBJqdR0FRquOaniU7xTsBoW\\/yRZNOE258Cq7zADYD0qfSLd77UooVBwzYJ9qN2PZXO\\/02waPQREw\\/eEecv+fpWdtaW6WcgmNV3EgZxXVsVj8tVxgLtx+FcO13LDc3NtuIi81gy9sGtVZM5fiNmycTZlYHEnIB9Km1FbnUpYNPsjh5G+Y\\/3VHeotPkiuI5NmF8pOfYVVtvFWnaddSxIZZbl+HkRM7R2Aqrq4uVs1tQ8nQLI2tkPNvJOJbhv4aoaFbb7lpnyST1PWm317bTwB4NztIRjd1zWzpVp5UaA9cZNC1dweisch8U9OedNOniQny1kU4Ge61wMHh7WrmESw6Vcuh6HZjNfS1hppvHLpFHI8a4QSdAT3\\/Sl\\/4Qnkm71aUTNyQjYA9hRyq+poqiaS7HzoKTmpdoB6UoCivoWrnj8xEAaUhiKeSBUbPngUWsF2wwB3pOKMZpwXihDYop4puMUozTRLFNOjl8qQMelNqNzjinJKUbMIOzuarYdQw6VCwplrMCmxjyOlStXzGIoulOx79Gqpxuhh+7VScZHFWiSeKryLXPsza42xHly7mAYHqCK3bfT9PmdZEiXnqpFYStipY7l4jkMQau4ranbWujaM5BuLSLaeM7RUmpeCdB+VoUiwwJOFxiuYt9deMAOcitJvEUUsO1X5xg1Embws+pmS+EtPY5RHGenzmmyeCLZQCs0qsewarbaov9+l\\/tgHGW6dKzjc3kolOH4ey3SkxXbDH97vWdeeEZ7OXy3kkBAznNdHF4iMQIWSs271gzOWd8\\/U1tF6HLUSTOZuNIki+7Ix+tVmj8phzmta7vTICoPFZjDdzVaHMyeOTOKtA5FU4V9KtjpTQgxzVu2j3EVWRdxq\\/augfZ6966cPQdWduhhXrezg2Z8oaOdlfhga7XwZY4Et23VTtWuZv7bDxzYzghW\\/oa9H0uyWz0O0A4Zow7fU0qtH2VRroKFf2tNNFq4mCtGR1DCsPUbUeY9yigiQ5Ye\\/StG4YvtIGcEfzqK8GUZRyMkipYlcj0VBHbXjMMI0RU1ydjYCGHdKf3zHcwI55rdvNQNhYeSvWVhn6Vnwie9fcFLe54xS12K8zV0i1+03ca\\/wACnJPpXXxBVkZhxGg+Zj0rBtL2w8PWf79XuJ35xEPlz6Z6Vmah4hudVYIdsFuOkSHr9T3o5rLQXLd3Z3Fv4kj0i0ub57uKGJV+Z35wPYdzXlWs\\/FfxBe6nLLpcqQ2ecIJlyzf7R9M+lWdcna58Lahb7C6+WHDAcLhhXnq7dopOT2NIRW5uk5FRMSOlOQ04rmvpFqeLsQEmgVN5dAj5ziixXMhig5qUUUVViW7gRS9qaWppakK1xSaa3vTlBNXNP0u71a48q0hLkfec8Kv1NO6SuxlABgQQcHtWgFkCKJY3RmG4BhjI9a6uy0rTNFG52W7vB1dh8qH\\/AGRWTrNwL69849VTYPpnNeTjakJw0OrCzftOVGOeDUTjIqU8HmmuuV4ryLHr3KrcNTWNPdcGmEE9qC76EDMfWqzyMp4JFW2iY9BUL27HORimQyv9qlB5Y0oupRkZNNaE54GaYEYdaLBzMn+0vjqaPMYjqahCn0qUUCbbFJzS0UAUxE0YqwBwT6VDGMDmpoZlE6AjKhgT9M1cVdkSdloOEgAwMhvQjBoRyrhhXfm20nxNYRxzxiGdVxFcR8FfY+ori9V0i80W7FvdqCrf6uZfuyD+h9q9zDKMFZHkOsqzfc2tMW3v49ksgBIxzXRvrCQRraS5V0XAyOorzmF5EfKHBroopWuoVhlO5gMqT1FPEUPbK63RFKp9Xdnszp4rhZVBBpZJBtOa5a11B4ZzGcqy\\/eRutXbzU1FmxDYOOvpXiN2dmeqlfVFK9nSS+YvdiDb0JXcBVdrqzyPtPiWIj+6ynH5Vx9zfzT3MrrIQhbj6VXI8zljk+\\/NSmzXkR6zoY0u4ISDxLBtPVAn+NdMIbGw+ZbF9QYfxBFx+lfPfkAv93mtvQorya\\/FvbX09vMPulZG6\\/TOKLsTij1TxlrXn+C9TiWyNriIAgpt\\/iFeMAgKAT2ruPFmsazH4ZGm6lNFdJM4RZgMNxzyK4Khd2UlZG90NSK24Y70jjmo8lDmvo07M8W10WcUoNIjBlzmgrWy1MdnYDimnpRSk0mxpDMUfdGT2pw5IGOT0ArtfDvhMAJe6pHkcNHbn9C3+FRKSWrCU1FXZneH\\/AApNqgW6u90Fl24+aT6e1beualBpVuunaeiwoBg7euPf3rf1G\\/WysmmbC4GFArybV9Read5iTliT9K8\\/EVX1Io3rS0LNxq3l5+btUVpc\\/aYTJknkiuZmmaVjzmt7TRsslFedVndHs4aioO5NL1qPeRUzYIz3qs4I6Vznc0K\\/PIpq4JGeKYJNpwaVmBHBoBeZdj8pDyQaZceS3AFUvNKio2lz3pDsiQoi8ConWPHA5qNpT61GZDTE0h2xRTSOaQSE0ucmmQJtzTwuBkmgYAyarzT5O1apCZJLN\\/Cn50sBbO7vVVRV2HAwTTuS0bXhfVWjk8pmyAelehmO21bT2tLxN8L\\/AJqfUV49pMhj1Dg9GxXqWl3W6JcntXo4eba1PDx1P2c+aOhyGo6NcaJqBgmO+M8wyjo4\\/wARToZ\\/LcAH5j19q7+7t7bUrM210m5DyrD7yH1Brz7W9JudBnMzOZrXftEoH3T2Df416CqqK94xpy9u7dTr7Sx07W\\/LgvUZHK\\/JMhwQfSsbxV4R1DTdGup7a5juYI0LNk4dV7n3qhouvsswD5Udia6PXtQn1Pw3d21u2ZJY9v4d68fEcsptxPYoRnCKUzx9D8uKsRxsVziooYyX2sCCDgg9q14lAj6VzJdzsM1F\\/fKM85rptAtnt\\/FEW8cSKCp9TisIRZvo8D+IV11wwtbzRpsYAnAJ9iKOpMhnjwf8S61P\\/Tf+lcLXo\\/jaykn0B506W8okb6cj+orztdpXOaSGtjoHHFNYZWnt92mLyMGvozxRsT7G29qtggiqUq45FSwTfLhu1OM+XcJQ5ldE5Fauj+G9Q11z9jjAiX78z8KP8ab4b0GXxNqIUbksY2Akcfxn+6K9S17y9E0y30WwURSTER\\/L2z\\/9bmsamJW0SHDl3Oc0Xw7p1jIZkzcyRnb5zjhmHXaPQV0RbcOefWoooo4VWGP\\/AFaDatNvpxa2UsxIUKuc1m5aXbOGcpVJ2ON8ZasGbyFPyrxgd688upWlYjNaOrX5urmR85G44rORBtLHqa4akuZ2PXw1PkjdlULggGujt\\/kgUe1c7u3XSRr1LV0mAqgVyVD0qS6sRmx0qMtupWBzkdKaazOkY6bh71UaQxtg1bLkHmq08YcEjrQTJEbShjTCarOWjbim+ee9BNywSaaSSOKiM9J5\\/pQBKoIp+4LyTVXzmNBJPU0ySSWVmOB0pij8aOtOAzTAci5NWY+uKjUYFSpTuBVjPlaqc\\/xc16Jo8p8lcGvOLg7b+Jupr0DSObdTnAx1rswr1Z5eZR91M61CPLBzzU9hb299qD6fdxpJb3sJVkb1HSs+Jw0IINJJdNaG3vQTiCT5iOyniu96qzPFpu000cd4j8JXHhq5Yo7S2W7Ckj5oz6N7e9M07UJIsKxOK9nv4LfXtIacRB5UXbcREfeHrXjevaO2g3SyxZexlPynr5Z9PpXHOkrXie3QxTb5KnXZker6HHfj7dY4W5HMkfQSf\\/Xrng5TKsCrLwVPBFdTYXiNja1TanoUerR+dCAl0o4P972Nc7jfU7VK2hyNkN16hJ711esQ7tGjlxkwyLIPwNctBFJa6gsU8bRzKwyp\\/nXbXcQl0Yp2IrNFSd7FbxjdyN4YAiPyXMkat7jBOPzFedFCvBDD8K9Fns7zVPDMMdjCJZ45QdvbAB\\/xrDbwv4gZiXsCzHvuX\\/Go0RS2I6YeDT6awzX0Z41xGGRmptG0ebXNUFpFlYl+aaT+6vp9aqTOQBGoJc8ADua9Z8B+Gmt7SK2A\\/fTYeZ+9cVapzS5eiNX+7jdbvY63w3pdpomkLciIJDCu2FB\\/G3rXKy3R1fxVPOx3R2akH08xuP0FdF4z12HS7FliA8q0TbGo\\/ik7Vz2jWLafo0Yl5uJj50p\\/2jWdP3ndnNWfJGy6fmX0THU1y\\/ju\\/NtpQt1bBkYA\\/SunRvlznNedePLnzrpFP8I4FXVbsc2GiudHGyEu\\/tUFzceWm0Hmh5fLQtnms5mMjlm5rz5ysfQQhcv6TH5t4JGHArpTWNpUe0r6nmtknIrBs6khjHmomxTyeOajYikWvMjOaY444p5am5B70gsUp0yKokYNakoHSqUseeQKZLRWpaCMGlAoJACn+1JjilxVCFAqReKaBTs4pDJAakXpUCtzUoPFO4ileE\\/aI8dRXd6Ju8lQT2rgZ23XK+uRXoWkDbEmfSuvC7s83Mn+7R0kWPKxnmkKi5gltm+667TSxY2UkTYm4r0kfPSdtUang3WZYk2znMls32e4U9wOhp3jDR4282IrutblSV9PpXOXEzaT4qguPu22opsk9N69DXdxFNW0eWwkb9\\/CN0Z71jtq\\/melZSVl11XqeCDzdM1F7WTKlTx7j1robHWJIcK7ZHqKk8ZaUWj+1qmJojhvXHeuYtLtWiG5sEVyVYuErLqerhaqrU7vdbnaXVtaaxGrSYE6co46iryx4tUR8ZGBXKWV8UOVYOvqDmuisr8SgBiKz0Zs4tGt4NfyL6\\/tDwVJYD8f\\/r11LR5bJFcpo6tB4ninVSY512Mfeu88gVzVE0zSDujwUimHgGpcYpkuFTNfSSdotnixu5WLvhSxGoeJE8wZjgXzD9e1e86Zt0rw+96APNm+VPpXk3gKxcW8lzt+e5k2p\\/uivUvEcwtYLW0U\\/JBFucfhXmPWyfU1nL35TX2Vb5s4TUmOueK7bSw5aG1P2i4Hv2Brorlz0AzXL+CWa5Gp6s4+a7uSqt\\/srXSTEE5rak76nBitLQQhYpAzcdO9eUeJ5\\/PvZPUGvT76XydOck4+WvJNTy00hOTuaorPQ0wcbzuznbsHC+9Qou6RR71b1FStyoxgBRUNuubhB715kndn0UVZG3agKyitKs6I4kFXy2Kg1InOCahJqVyMe9QMeKA2GuaYad19qaRQFyF25qMuCKfJzVcgigTEcA1FT2plMlig05aQD1paYhc0tNzQfakA6l3YU80g96jlbCnFMCOBfOvol\\/vOBXpNjGUjX6V57pEXm6tbr\\/tZ\\/KvTrVMKvFd+EWjZ4+aS0SL8f+rGRRHzNil2ssWTimWn+tLZ+tdy3PFlsR+J7I33h6URnE8H72PHXIqbwrrpnt7O\\/BywxHMKuyMpXB6EYI9q4rQ5BpXiC90k8I58yMfnWc9Jep10Hz0nFbrVHb+K7BWnLKAYplJFeceEr2Hwz48hW9gSS0ZvIkEi5G1uh\\/pXq5H9qeGQRzNbnHvxXl\\/jPTNvlXsYxzhiPU9D+dY1Ic0LdUduHqqNVPpP8z3DVfhn4U1k+fHbNaSsNwktjt6+1crd\\/B2\\/t3L6VrUcoHRLhCp\\/MV0\\/w\\/1l9X8H2U0jZljHlP8AUV1ayHiuSx6PM0eQJoHivR5QbrSnkVTkSW5Dr\\/jXQQa+giAuLeZJRwylCK9FWVgcZpxYMctGpPqVqZRvuNVLHj+ifB+\\/vESbVroWiHnyoxlvzrkfiJpmmaR4lttC0WNi8aAXDlslnY\\/L+OAa+jtSvY9P0+4u5ThIYy7fgK+X9Enk8ReN59Wny26Rrg57AnCD8q2depVlZvQj2VOlFysep+D9PVLu1hAAjtkGfqKq+ONXWLT9WvN3SPy09yeBWxpbfYNDu77o7ZVK848X3LXDaZpWNzXc+51z2B\\/\\/AF1o\\/ib7aHCvhin1d36I6XwvafY\\/DNhD0Ji3t9TzWjJg45yKcsaxRLGOERQv4Dj+lQyn58jgegrqpqyPMxE7zbKGuuBpjADk9a801CM7zzXouvswtEQH73Nef6ipBzjpWNU6cI9TA1lCl3HnvGDVeyXNwKu66B9qhOesQqDTE3XJ9AK8uW59HDVI0QpDVdjG5ATUJSp4VJGKg2sRSjFQkZq08R71AyYNMViMrxxUZBHFTYIqNhQKxXfrUTLk5qwwqEjmi4NWRCwwaaRUjAUymQxo70mDinAUpFAiLNAJHSnlaVUzQA1cnmo5jjirflYXNUpeWNMDW8LRGTWkOM7FLGvRIFwRk1xXgmD\\/AE6eZuQF2j613kYx2r08IrQPAzSSdRIfKwEeDS2agr1qGXeTt4xVmAAR4Awa60eVJ3JJ8KO+a43xSpsb+x1eJeY5AsmO461107nvWJr9t9u0O7hAy2wuuPVef6VNVXidGEmo1E+h1\\/hm7QXZhJzHcrx+VZfiLS1ayvrR1ztBdT+ZFYvhDUHk0u0nLfvICFPrxXe+J0RoortcYmj5NYt3s+52WceaPWLuY\\/wauZT4cvw2di3Ix9cc16bHMD3rlvh9oZ0rwZCrL888jzH8TxW2zmNsHpXGepubEcnNWlIKisaKbvmrSXI2\\/eoA\\/9k=\"}', '2026-05-09 21:59:44', '2026-05-09 21:59:44', '2026-05-09 21:59:44', '2026-05-09 21:59:44'),
(4, 5, NULL, 'NIN-KCXQFTJR', 'NIN Verification', '53449684354', 150.00, 'Completed', '{\"nin\":\"53449684354\",\"surname\":\"ADAMU\",\"firstName\":\"MUHAMMAD\",\"middleName\":\"GARBA\",\"givenNames\":\"MUHAMMAD GARBA\",\"dateOfBirth\":\"2000-01-29\",\"sex\":\"M\",\"gender\":\"Male\",\"issueDate\":\"2026-05-11T13:37:43.599121Z\",\"trackingId\":\"9724747bd732a4f8d9fea598e478dd01d5858368\",\"addressLines\":[\"\",\"\",\"\"],\"nationalityCode\":\"NIGERIAN\",\"passportPhoto\":\"data:image\\/jpeg;base64,\\/9j\\/4AAQSkZJRgABAgAAAQABAAD\\/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL\\/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL\\/wAARCAHSAV4DASIAAhEBAxEB\\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\\/WoLGK2W5G0elKSR24601jnI96cTkcZ\\/xpAN3BVLcge9SR5LZHOaZsJ\\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\\/hU6ggfPgA\\/pQIcBlPlyBj0qNpMYPOKiub6KGEb5URQMHJrCu\\/E8aSBYUEqD8BTswujo2JKgkc1GJC8mWX7vHFcbP4nvJWJXCKewqs2v3x+US7R7Cq5GLmR6DhTzjk0rEDgAYHpXnqeIb+MkCYntVmHxVeR4D7WHejkFzHfIA4\\/ug+nercYZEY\\/LnsPWuMs\\/GEXmBZoiqnjIPSuqtdRtLqIGKQOxHQdq0irES1JZZPLTsWPU+gquGJCnOc96fJjt1x3qJhhM56cYFKTKSFEmW+bgCnozO+VkwPWqxDk47e9OU7Mc\\/h61MWNo1IULKAXVgD940Tso+Unp3qCP5yoUfUVJJllAUDg1t0M+pTdl+9zjOKh4IAyOOalmbnlRzyB7VV3MCMfiKwkjRE7YwvzZ56CpAxLqQp\\/3ahXBYD8amXd5gOc\\/L0pxQMm3KULds96rSOBkfj9amzkFccCq7ghy5HOeB+FU9iURggAg8FutNJDABeg4zT24dtoycdaYw2nAPHfFYs0A7QgwOTTNoJ5+pqRgAh4zioyQpBIzkUhiIm059elGM9+KVfpzig46UAaUvDkBhnPFQlFY8klqnZCckqAPaoBtAwCCaqQkKp2tgHipRt5A61AdoI55PepF65J5qRiSQBuWJp6Dy1AU5HcetJv4wTke9Mxt4Dfl2q0xWLkMwlVjjaAe\\/WpWWOXYNozmqFtkuxYlR2X1FW8jORk9h2rVS0IaGSoucjknjiohHt69BU0aSKzCQ53fdHpSupH3cqAetJq40UFQo7E5IzknNSFxsZu54p8ijcw\\/hPQ0xgNoUnPtWTRSGwAKCEPGOKnHy2u4nLEHNRBc4K8AdqQZYcHj0qRleYAkEjn29KjlAVd4JXPTNSTuqAluO2a53UtaSNGihYu4GNx5AppXE2ak+qQ2seZXxzg4rBv8AxJLLJttfljB+8RyaxJrh52Jdi31qAkt0HArTlSJ1JJrmSZmZ3LknvUBOOc04IxPAwKTy8cHOTVXHykeevPFRk5bip2jBGKa0RUcUri5SIHuaXdyDnimlWByaYWPXFO4cpMZDnFTQ3csJDRuyN7Gqm\\/PelB96YrHcaT4oikAjvciToGB4NdGsqTL5qtuXsBXkwkx9K2dL16eyZULFou4NS0B325jk55zT0KqcuM+gqnbXsF7Cs0Lgeo71aI2rlRkmpGXYZfMJCDkj6VJLKdw2kBQpzzzUMBdFAJBHenygNlcg+9bJ+6R1KzuSee\\/BNQ718zjqRT2ye\\/3eOKh2j6k8j2rJ6stEvmqmGOc1KjhyuO\\/tUCxFlAbgZ5qzAAqAAHHI5oQmKxOWI5B6YqOXHINSSAlQBnGec1Bk5bPfpmqYojHkJOAAMimH5Ylx370Mmc9OTxzSNwoUAEKPWsjQVpSXZf4cYyaVsHyzngCowMnD\\/pSsg8xQuSO\\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\\/0p\\/AOSKjBX3pwb2NU2QPJzTGIGc9KGPBPbFM4KnPFICFscbQKpTCrzFdhIHTgVTl5QE8GkykZU4APFQHvVu4UBiBzVJyQKzZaRE3NRkc1Ic0zac0h2GYFRsOakamE8UEjeM04Gm44pRTEx4NO6im9qUGi5LQ2NjFMrjsa9J0+bzLSJwRt25rzaRcc123h+fzdPRd2AhxitEyDoVkA2jGM80vmbsnGMdPeoImJJbv0GaGYgsOOlW2TYA+VyfqaN\\/GBycZpnB+9x9PSky3Xp14FZMtDgwAAP4mlVwQOe9MBwueuaUDjpjFSMfyWBx2xmgZHU0A\\/pRjHfqaQAQDSkHoOMU3HX60ZPY0xCNGWLbjgHoAajDF5tiHAA5J7CpWwH5xnHFR5CljwM9TVMY2XKkdCB1FNGAoJJye47U5mLZA9KVEAyOuKkY3\\/VJuwWPakUyyKDg0MzHAz35qRZDGp3NnOefWkA\\/LFdrAY45Bzmms+WOFxjihQwXcWEY7D1pEHQsevYUAABCZxyTjJpqrkgE8dxTmYmcL6ck9hQ3JDBuTxmgDlvETKb5cDjHIqFD8o+lP14st2ikcgdfWoEbgVb2HDcuKx21LHwarI3FWYjzUG1iwpwKnj5GTTNnANSrgDmqRDsOA5FSAVB5hHTn8Kck\\/riquS4iudqH1pN\\/wC76U9iGBORUDtsXNU2JIA25SCKqzLnk1P5gVcn61DJIp69cVLGjMmHzGqjLgEGrTnn5u1RNggk1DRaKmM0xqsYGahYcmkMgfrUeKlbDGkoFYixxQKcSBTcgnigTQ4GlFN704GmSx7LlTn0rpPDkii12jO4npXOk\\/u2+lbvhwjyScHIpoho6ZX2rgcfjShscnk9argsT94c9xTic9entRcLEwJYkjAPqaXJwefxqFHPOOKcCcnNK4D84ABpUJyAPzphLduOacgA+uaQExJzjNJuwOKb3zmgcAjFADs8e9AcAAHtTepyDxSApuLNnngCmArN84HVj6dqTZ8rcZzUWSvb5jxQZPmIHYdTVMB8mcckKDTQTznle2KOnzN8zHpRkgdMmoGA4FIMuwbZxmhGY7sjvgCnhSCNxwOtACMg3BnZvxo+XgqCceppzHI5Gf8ACo0YPnghR3oGKoHlnAwfelIVVBFIp3SFP4RzmnYBA+UYzwaAOZ8Rj9+jY\\/h61RjOY1NaevxOU3tjA4wKyoOYxVvYIbluPk1ZSRVHXmqikrTeTJjPHeoRs9EaD3DuRg4AqFrzYMM\\/SmNJtUKKgk2vy35CrRk43HtqfOM4FPS+XP3sVmyW+5uGxVV1ePPz5o0YJtHRrf8AuKe14rLyc1zSzuCM1MLkjvS2LWpstcAt1zUcs+AMVmrNnmlaXjrSuVYkmbc2R0pm8bOartNzioXlPei4rIstKB0qCSTJqu0p71C7Z6mgV7Fh5MGo\\/tAIxVfDHoTUiQE85waLE3bHs5xSLJin+WQOuajZPakDuTKQ3SniqyZBqyvIBpksdI22FjW34cb\\/AEZiSeT0rAujiMAd63tAZxZnsM8e9Mk6BTjFSDpnpVVHIOByT61LknOcYFSMmBwpIFP5Bzmq4bOOCDTz19QetAiUHceT3pxbkH3qIYIpwJ456UATbu1KCQetRnoSDzSjgjmgCTcAOnTvSZI5PekDj7tKRnqaAI2OAWI4xTCxALAAZp2S\\/JwB0ApjZLEHoKpghRuPGAM+lOYkZxyRTQTnBQ4HekZiflHBqRjkjKgsSRntTlwSu7PHWkHTDMTgY\\/GgnDZHegYu7C8DgHinKP3W3BA5qMk7sYOKk2YCjd+dADUwrsOTxyaVtpIGCc9AKAArEADJ9KRXKQs4GKAM3XFSS1I3BWXt61zlueo96tXN8s11Ikh+bPQ1XjAVzxxV9AjuWSeKaWVeTTSflqvM5IwKzOjoTfaCzbY1yfU9KkaCXbl5AD6KKqpcxQfeJJ9qSTV8fu1tfnboa0irmEmRXG5ekjfpUAJOAX\\/OoJ7mZJ2SVNrDqAaRZc8kEZptCTuXPIJGaZ5ZFOgnxweRVtUDnIFQ0aRZVVT0p7xtt6VdjhG7pV82aiHJHakWcvIGU1C7kVfuwA7AVnMck0yGMyTRz9akRcircFqx52D8aa1IuVVV9u4LhfU8CpA4H\\/1jVxxBEMyyqD78mqMtxCThXzTcRcxJ5i0ZU1WLhvumlViDzU2KuTFAelSIMYBpqmpF5IpCZBdMdygdq6bSVKWSZAAIrmXwbpd33Qea6ixmikgCo2cdqZBfGCc57VIp+X1ANQ8dsfjTlOOuCPSkMmycZB\\/CnqSXx1Ud6hDdz+VPH3ck\\/hQBOCDnrTl4qEEY60KWY5bgHoKBFlevPShSeSBxTAQMU\\/O3v1oAk+nFGaYDxQc0AOwMZ4JppJLfWkyOgPA60wnBwM02MewbaAKFxk4HOcZo5YccU1eCAeeaQxwG4mggkHjHalJ\\/eZzgelO7dTQA1SyLhufrSM3mMNp5A5xQ6B8ZJA9BSArvwkfzdee9AiRQS3rik52nPT2pNzdD1HU0M2MqCD70AcZfWpGqt1GTkGn+W0bEHmrmpHN057is+BnadtzZGKpmiWhOwJUYqnIrMcCtJV3DFHkKeoqNjRq6I9FsInlLzkMe2an17RWJF1bLlQMMo61VAkt5CYyRVoatcqmGAI9M1VyXHQ52GymuJ9qo2e5YVuXFraQWixuVJUfjmo57+WXjYFH1qg0vbAzTbuQo2IvKVSNjbsnp6Vu2USG05++KzLa2klYFhgVrxqIY9op2H10ARjeK0LkbLP6iqsQLyCrV\\/kRgZ4xUmj6HI3oIZjWb1Na96uc1ksNrUrimi5bIuSXICgc5q5Ek96F8ghIc4yD835VnoRJhSMj+dWongjP+qKn+8jEGrWiMralrVtETTraC5iXed2XLfNn61hXLrc3byGNI93O1RgCtt9SuVhMRcSxH+GQZqgptlfe1v77Q3FHMJxFttND2hcjDE8VSljeCTa\\/PvWk+ouw2ooQdhVJ90h3O2TSuNqyCM8VYXtVdRip1pAQyfJMzHpVvS7rbeqoyAxwaoykPKy55FT6au3U4g3TdQSdfuGOKVck+1MOMYBpw46GkMlUjP+FP3Ejp7YqLfgHinhsd6BEq8AD0p4bAyDUS5H0p6rzk9KBEobJ+lOByRmmAk4FPFADwxx1p1M70uaADB5zjpRkfjSZBNOI+T0FAxueOuSeTTlXB6dRzTQoKkDtUi\\/eJz0oATpjj86duHQmjPrTcDLH9KAHFhyRzTQRk46+tPCIOSfyNR8Hjdjn0oAcUJJy1NwWIBHGccU5QFAB4GfrQGIALclTnimBzN2u+6lB\\/vGqcabLjFaV\\/G8V47EcE5qvKg3rIvOae5pFkkIq0se4cYqtF\\/Wr0RqGjVMrSW4II71Sezc9DW40QdcioWtnxQO6MJrJ2PLflU1vp67vu5PvWuliW5\\/WrMdsIl65q0jNspx2wQYAxTJVXdjNWpZAoOO9USckkjmhsqEdSaA7ZBirepL+53e1UrcFpBV3UZB5AU9cUojluctdjk1kyLya1bvqazH+8aSJkNTI6Va4ZRVdRg1OvrTuSkJgjvTT9Kl4xijZUjsQY56UoAqUpTdvNMTiNwKcvWkIpw6H6UEszmP75jVyzy19AR\\/eFUh80jH3rR0xd19D7HJpkM6pTgdqcCM+9RcjH86d\\/FnP40hkvRc4pU+bn+dRlyB6ilU7nHpjpQIsqB604EleRjNRqcDHFKvXHU0CJlYArkjnpTlaoeCR7dKeORQBKDke9OOTUCsd2cVISR25oAcMk8Cn52hcnJ70wDjOcf1pygEcdM0DHhiRkAAUbcDOaRsZx6U4fKM9qYBnHUe4pmST93IHbNOJZjz3oxgZxj3osAHPTHXrTRgHjt3pwfjA6\\/SlX6E55IosIarFnUkEY708McjGQM96ONoA4NLjkZz+NAFPUbcyxb8Zdf5ViYVBgdK6gqNxJPFc9fWskM7HadhOQaY09SupwatxPVEdamjbAqWdMXoacc2Dg1Ms+f4ayhISamWXbjn8KEJmgbgg9PyqOSYt0+Wq+\\/PWgnjjmqERXEmSfWoAp25p7qd1PS3duewpDTJdPTdJ7Uupgjg8irNigjkXnk03VY+vXB6GmF9Tlblck1nSjDVr3CEZ4rNmTOcVI5IrqeasR9KqlShz2qaNx60GaLBGBQDkUzdRmgu4801jSMT61Hk0CbHGhjiJvpSUkn3MUGcmUymOg61uaNaFAZ2HbAqpY2v2mYAj5Rya3kCqoReAKZBLkmPj1ppPIAJoHQgcgUJjjikMl3AfLyW704n9KjJXGM8d6fywGenWgRImAM5OaeGxzmogfmyPxpwPBOOKAJEcFsZ5qQHI5BFQR4CZAxzyal3DPHPtQIkHXGKkXH1NQ5JfjNPQELxyaAJh3JwKdtGeDTOAPu59qX+HHemA4ru6GnEZ6Entio1bsBT1Lbumc0APHHA601juPU0q5HUCg4AJOfwp3AFXGP1o4zk8dhSAk84zThkHoM+tAC4IbmnlSPqaaQxxgCgs4bJbnpTAftwP50jIH69COhpNpPQnrSkMW54AFAHKzjZdSJ0w3SkDYqTUkMd+5PfmoAeKTRrBkobPelXAbPeogfSpUGRmkabltAXAJOKsKBtyTmqsYJFW16YpollSd9ko6YFI2oiNcZUZ96ZqMbEb1HIrn3tnuXwz\\/AIUrMalob0d78+5W\\/Kp59Q8yMK2elYltp08ByHyOuKklmwOeDSs0Ve+4XEinNZ0j80+4mCqTWW3nSufmIWhIlyLpwRVfOyTA6UqbkXBbNNIy2aZNycEkZFKCc0xTxTyaQXFzSGm7s9KWgTY4Vbs7RbpmDZwvpVQVraYuIS3TJ5pkNlqKFIFAT5QOPc0\\/+I+h6UowBSA8HPakIdn5eDgUqkZwOvamcfnStjaAO1ACkkMOAakUkD3NRbjkemakzz7A0APVTjrzT8+v3RUSkDcSeM0F+q5IPpQInXlF+X3pC3znuT0pM5AANBwhznNMCYEqOTzUoPYHioAc8+o4p+7AzigC3yOmTTj7nmmjB6tTHlGSAOnekOxKAvrzTuAT81QFiR1p45PXFO4WJAy8gE0pcduajH+1xS5B5x+dFwH55AXrT+5GM\\/So1Kqoz3pPmJ4BC9xQImKnjNAUZByOKjwxPU4pdoUUwJi\\/YfnTWY570znHHFJkjufxoAxtcjxKkmOo5xWUp5xW\\/qcXmwFh1WsErgmmUiQCpYxgGoFJ71IGIGRUmqZcicCrKsOKz43yKsLJgUIGWyAw6ZFV3tYj8wjUH2FAm96Rp+MLzV7kbETIIxnpxWNdqJJDs4Nas5kMZIFY3zic7waTQ73K81qyjLEmq2MVtTKHh46+9ZEilSeOKVgE2jHrSFaA+KXcCKVguItOPSm0o5osJsQcGn9abjmlBp2IuL7Vu2qiK0QHPrWPDGXlVcdTW+q\\/IF6AcUMBTwOuc0gYjrwKADnBNMyd2eo9KkBxBJxn60uOMdqM56UKGycn6UAKOvsKeMHk8g1GQT0NPTjjtQIcArHOMYNO+UHPU01uny0q4GO1MCU8IcCkU4XBXk0buvpmjOWyeKAJW45POBScqgLd6RnJyaTJKjigC2CRknOKRS2OnJo7YGeaXoQP1pFijOOfWn5B71GDkjGc4pTnGBzz0oES\\/wAWc00kkmlPQ57Uh5XJGM0CYRAgEkgsOT7VIG445z3pqhc4x9RTuB0J4piHZzjCnPqaUDk7hTc9hnilUkscc4pgLu9sUpOVoB5zgUH5vu5zS3AiZQyMD901z1xCUlZeldja6Vd3RG2MqP8Aaqj4i0lLAQlpAZXHzL6CtFFi5jlfu1Ip4okTmkGRSaNIseG29aXzCTjtULNiqrXLKx+Rjx1HakkU5GiZlT3qRL0YwABWOZSRnBpA0hOAD+VUkS2bElwpXOelVTPGyncATVCSRl4OagMxX1oYK5ZaUtxmq0h5waQvzmoHfnrSBtiMBmm9KUkHqaa0qKMck0WFceDxTlGeaYh3c4qVRxSE2LilVCelKF71btrZ7iZYkHzMe1NK5LZLYQ\\/MZCDgdK0Q3yAnqa6i10m3gs0hZASBycd6rTaJGSTGcHtQ4gmc+Rx96kPD4HJ61oTabcRHldy+oqm8RQ7WGPrU2C5GQRyTz6ClAJING0HkduKAGA5596Qx\\/GKAvzY6AU1eOBTgTuxigB\\/HYUp7Z49KjA5JzTzgnk5oAexPAzQM880zIzzzz1p+c5oAMhlUEnHeld24wOBxSqQOSexpqqz85xQBdzxx1oOQOO1RqTye1OUZXqaRY4A8YPJ5qTAVeOS1MHzAnGOacASMDtQIccdew604dqYQQQM8HrTx97PanYQ4MD060\\/HHpmkUAcg04IXbavJPbFNITDv2FOSF5WxGCxPatix0CWfa02QvpXTWmlQWqjCCtIwuRKaRzNn4fuJlBkOxe9b9nodrbgfICw7mtPKoMcAVE0\\/PyitVFIyc2xJ5IbK2kmIAVFJryDxBqrXd+7s2Tuyf8K9D8V3Jt9H8pj8z\\/OfpXj1y5eQk9SatIaNIESID7UmARUcXyxL9KkzkZrBm6InHao4\\/kY55B6ipzgioWGKhlrUmVYsjgY9K0bVLdusYz2rG3461LFcbCMNincEX73T1I3Kq4xnismS1QYwBz61fe+dkxnIrPaUnNK5okkSrZpJaiRBk+lU5rZVPGKuQTlEAzxiqtxMGJxxSuDs9SnKqL0Aqvt5JqZwWPJpvU8U0ZSYKtTKvHNNUVKvPFMkkhheVwiDLHoK7XQ9F+yDzpuZD09qzPD8MEC\\/apF3seAR2rqobyCYfK3PoeKaaJY85B600n1p5phpkiHB681XltIZuWXmpyKTmlYdzHuNH2gmImsuWGS3Yh1IA46da67FMkhjkUh1BFJxHc49QMbQc4pcc5rbutG6vAcE9qyJYJYjsdCPepsMZ1oHUAEUnANKODxSGSEgDpSjkZzTMmn7vk5FADicjpRkBQQfbFNDZ6UoI5FICyCQuKd3WmZBOB+tPTp6UF3JMngY4pw469TTMcfWpF6cChIkDz0\\/OnqvQYp0MTzuFRck9q6bStAxtkn5x2NaKLZLkkZVjpM94QQu1D3NdVp+iQWig7ct6960IoUhUYUDFDzY4Gc1qoWMXO5J8ka9gKhacscLmmKjyt8xwKseWka8cmtCCIRM5+Y1ZS3VRk1HGSWFXgvFRN2GtTzrx7MfnGfugIK8wclpQB616D48kP2kjsXP8q8\\/X\\/XA+9aLYfU0BwuKaGI69KcelNasWboeDxTGpFOPpT+MVkzSJAymo2Q4zmrJI9KYRkUIbKjM6+9RGWQdhVxk4qB05oJuVzNIOlRtI7HmnsMGoieaBXADNOAxSAU7GTQIeozUM9xhgiH6mlml2DYp5PWqTElsmrSEztdClzD5ZNajqY3DLnFYOhPkIw710mOKzluNDoryWLALbh6GrsV7HJwflNZbrjBxUiLuFNNiaNfIPQgiis9A6fdciplnkH3gGFUTYtUq\\/SokmRvUGpc1QEgXI4NQTWyTAq6j61IGPuKkDZ68+9KwrnP3eklPmi6elZbxmM4IxXasgI9RVC606OdemDUtDTOW9Kdk1Yu7J7diSCVqoDUlEqnjpzRnBzTQ21QcZppJ60gL4APGMYp6jNIoB5PHvUijJ47UJDFADAdcVcsbCW7kCoDjuxqXTdLlvJgcYT1rtbKxjtYgqAE+tawhciUrFbTNHitIwSo3dz61rooY4XtUJYrk061fDc963UbIxbuTNAzDrTViZTzV0YxSFR2qOYfKQhfl96rSOQ4FTyPsNRLH584A4A6mqXcT7FqCIZDHpVorxwaREAAX0qQ1jKV2WkeTfEBf3oP8A00P8q8\\/HEgr0n4gw\\/IX9JP6V5uw+aulfCT1Lw5UUw0QtlMUrdaxZshvam7iKU8Umc1myg3hu9IzYFNkUAZFQFyBg0rDuSNJULuT0qJ5eeKPMBFFguNc5qLad2aexHrSeYo96LCY5RmmyyhRtXk1G0jN04FMIosIjJJPNNpx60KuTVoTOi8ONuXZ\\/cNdaBxXM+F7RyXlIwp4FdYE4FTNDRX25pUG1sVMVpCmRx1qEA8DNO2802Jt6+4qZVzWiQmxmwEdKcA6j5SfpUgSnbeKqwrkayeoqVXB6GkaPK5HWmBQfY0hFpJMH0NOOG6cH+dVgpHQ07eRweRTELPAkq7XUVgX+lNFlounpXQiQEc8+9KwBGDgipaKTOJ5HBFFb2oaUHzLFwawnUo5UjBFZ2KNEYxn065rd0nRJbrEsoKQ9Rkda0tJ8OLBtmuwGk6iPsK2XOzA6Adq2hT7kSl2JbS0jhQBAOKt42npUUP3Q2eDVpwNgatXoZblVxubHemhGRs0rkGcHcABT5JUbjcBVXCxbt33rip+mc1SglVO+atbvMGQMLWMlqXF6Fa5UE4zyelT20PlIM9T3pFizJuI+lTL1octLAt7kyjvSmgdKWsWM4PxxaebZ3JxkqA4ryRxya928TW4mt3XH342B\\/KvEbuMpcOpFdcHeJD3IoWxU5NVFOGxVlTkVnNGsXoIaZ3p5qNulQUBYGo3AIp2cVG5pDIHQdhULJ61YJqNqQEJj96TbUppMUAQlcUlSsM03bQIiK1IibiAO\\/FO2e9a2g2gudRTcPkT5jVoTOr0a08izjQjGF5rQI5qWBQQcDAxUZHz1MgQwilxSkU5VqEhkSoFmx0DVZ2YFRSISpK9R0qWGYOgBHPetEJk0YBFOIpFwD9al2qTVkEYX1pjJzkVY2ZpDH3osBCEzQ0ORUwj96kC8U7IRmsGjb2pySn8KtyRbgeKoyJsbFRJWKROGBHtVC702O4YOBhu9T7itSq4YdamwI69pf7q1SluAXIYAVbRiQPQ1TvosHcK6EZXLcErGMAdKnldhHkntVGxfcgFTX8m23P0qiW3chSXeuaeJDkDFUrd+oq9bpufJoBlyCMnDHpWin3cVXhHGKsrwMVlN3KiO6cU9RzTBUgrJmg8UtIDS1DBGVra5ijP+1ivFddtvJvHIHBJX8jXt+rr\\/AKGxHbmvKvE1sDLc4HKOWBropP3SWji24NSxNkVG45NLE2DzVSKgWSpqNhVhCCKCgNYtmhSbio2PGKtSR+lV2U56UDISOaTbk1YEWe1SLb81IFPy6Ro6vPHtHFQOvtRcLFTb7UoT2qbac9KUoe1VuIhC811fhe0LJJKByzYH0rmlRieOpr0jRLH7NYRJ0bGT+NXFEtlyOLYCPaqcv361VTAbPPFZs4G+pmgW5H1p4FNXvmpAuKhDDoKhYeXJkfdNWCuRQ8YeIjHOOKoCSMggGpTtzkcVRhkIOKtrzVxIkPPByKN2TinYpCp7VdiLsAwNSgjFRbM8inovY0JBcc8ir2NVJwsi5U8irhTCEn0qrEglikf0zilJDTKu3ctRYI6VcgTIZfxFQ4+dgTjmsnoWtTq7ZtyD6UXiboar2MmVx3q4\\/wA8RFdJkynpxw5FLqjYQL60y1Oy4NN1JskGgRXt2+atu2TIHFYVv98fWuns49sYLUpOyC12WIl2LUgpO9LWDLQ4U9TUdKDUjJgacOlRq1PFQxlTUxmzce1efa7bh7mTA4ZAT+VeiXw3W7D2ri9YgO9ZP9gA1vT+EXU8ruYjHMyY6E1ABzWxrUGy7LDo1ZOOa0ew0WoEJqzs4qK3AxVkdK55bm0Ss68cVVdOc1oOmagaOkDRHGOlThRj3pqpipQKQ7FdkzUTRirLdaaaBMq+XTvJ9qsBBUgUVSJF0uwa51K3iAzlwT+FempbhABXOeCrES3c9yV+4u0H3NdqsAySRW8VoZSepnGPCyH2FY04+aujljzFLiudlGXNTMcCJV5qXbxTVGDUwGazRbEA4py8UY5p22mkS2U5V8uXcOh5qeFsgHvTp4t8PA+Yciq8DYYU1oxPY0AKeF4pq4OKmArUzIChB4p8ee9T7M0nl4NACSj9zWdpzZSaMn+I1pyjEZFY2nttuZF\\/2qT3Gti1H+7Jz1BqvLgyk1busAAj8aqSqQ+KiaHFmtbv5Nzg9Ca2MBlOOhrGvIyj5A5rR0+fz4B6itSLEBGybAqtevl8egq7ONrFu9Zcxy5NMETWZCzIWGQDnFdNFcBlGBgVzFuPmFb0H+qpSVwvYvA5707HoaptkdD+VMM0qc7s\\/Ws+QpNM0Rn1pc1m\\/wBoSL1jU04alxzGaXIx2NEGp06VlLqcfdGqVdXh\\/utUSgykW7kZjNczqsQMS8eorcbUreQYJIrOvwk0e5DlQe1XTTQmeYeIIsAN6NXOEYau11m23mSPHJ6Vx8sZRijDkVaAkt2q4oBqhGcEVeRhgVlJam0R5XaaYeTzTmPvTCagoQgUlBNAFIBpTNJtqQUpHoKaENC1IqZpUSrtjZveXkUCqTvNWlclux3fhO1FtocZ2\\/PMS5+lbnlZFOs7Vba1jjUY2qFqVj2rW5zvcoyxgRvxXLXS7JyPYV2DjdGfc1y2pIRc\\/hUyKiVQMinqeaIx8tKVIwagscRzUi9Kb1GacBx1poQoGao3CeVLkdKv96iu03xH1FUA+2YOgq0orO08nGDWooxVrYzY8CnbO9C1JTEVp1wp+lc\\/Cdl2\\/wBa6ScfJXMtkX7D3qJblrVGrMP9ELHrTHTCq3UkUufNZI88VN5e\\/wDd\\/wBzoaNw2NG\\/iyu6qelymO9MZPDdBWvcIGjIrAOYdRjbp81X0JRtXS4BNY0v3jW5eAbCawn5lxQCLNsPmFbkH3MViQcOK2YD8tMhljqKQoCKUVIgqW7DRWeIYqHyjitB0G2oigoUrlXKJiPpTRFzV0x03y+elUO5VMXHSiPCo0bZCN6dqtFOKY8XFJoLmFqmhS3A823dZGA6dDXD61pk0EgkkhZGPDAivU2K+V6MOhFVJAJlKzIrj\\/aGanqV0PHgu01OjcV3Op+G7KYl44yhP9yuUv8ASptPk+bLRnowFDVxxkVM0CkxSisnE0Uhcc0YpwGTTwoFTYdxoSnqnenquamSNnZVRdzE4AHenYVxILeSeZYolLSMcKB3r0HQdATTAskoDXLDk\\/3fapfDXh1dOt\\/tEyj7Q4zk\\/wAI9K3I1VWyetaJpGEm2K2UxnNKkeVLsce1PU72Jx8o7ms3Wr9bS0bDfM3AqbgkY1\\/4hMLtBHFnaT8xNZEuoyXMmWUfhVRiZJCTySeamji9qrctE8cuO1PDnGMURx5qwsXtVKJLZAXZRxSB5G74qy0XFMSPnrRYLiKrt1ah4WZeSatxx8UrJxRYVylbJsfpWmoyM1VVMPnFXo1ytUkSxQKk24FC88D86fjFAFeYfKc1zM+BfPxXUT8Ka5W5\\/wCPxvrUTLgaNvjbkfeBFXQOp9aoW\\/JFaB4UU1sSzbZQV5rB1OLY4kHY10DjAHNZ+oQiSI8daoCa6YNaqw7qDWF1uK2WOdLjJ7LismMZu8GkMtqACK07Y5WqOz5atWzdqpmbLwqVBUS1KvSokNEvVajIp4IwRSDms72KI9vNBj61J3pdoquYCFVzxTXWpcYNLtBFHMBQlQiqroVbcPxrUkQEGqjLjg1pF3FcrFAWBA4qC70yO5hZSoOR0NXwq4xUsYBXpQ0UmeX6ro72js8akoDyPSsmvVdUsRMjOq5YD868\\/wBX0w2khmjX90TyP7tS0UmZq9anVc1AtWY+aho0THAYNdf4P0cXFwb2Zfkj4TPc+tc9puny6heJBEuS3U+g9a9X0+xSztI4UGFQYpN2RLkSzACEjPFVA4c7VGR3NWbrYybdwVF5Yk1zeo+II4D5NoAzD+KiBDRs3t9FZQFpWCgdB3auKv72S\\/uDIwwuflX0FMmuJbyQyTMWb37UqREkDFWoiI4YSeatpFip44QABUwj4qrBciSPFTqnFKq1IBTFcgdcVGo5qzIvFRIPmoAk+6KYZBmrBQFc1FsHpQIaDnoKsRZOARxUajnAqygxTFckXpin7eKao5qTpSAp3BKqa5a5z9rOa6m7+7muVuGzdEe9ZyNIGlZ8irbPiq1mNsefanBtxqlsJ7nTR\\/vDyeBUcgDZXNMgJ24z1qScBQmKoRXkTbYBfSskDF0DW3N\\/qTWLLxOtLqBqRgNH+FEQ2vRbcx\\/hTj98VZBdjPyipVqKLpUp6VnIaJATg0o6U1elOXpUtFC45pRSd6BUgDChfSnUz1oGIy1XlTnIqyaZJ90VUWSyk0Z7U6M4baakFMbrWhNyWSPK1z+pWCyiRdoKsORXRpzHzVG4A87pSRoeVXto9ldtE3QfdPqKWE5x6Vu+KVXzYjgdazdDAOq2oYAjzlyDTtoJN3PRfCejmx08TyoBPLyfYeldIP0pi8RjHpUorkk9SzjPENxOlxMjMQpxgeormFB3Yrq\\/F4\\/0lD7CuXTrW8fhAsRJkVet4stnFVYelaVr0q0QyUR+1O2GnilqhIYFx1pwWloFADXXioAvzVZfpUA6mkBID8tMzyacOlN7mmDHovNW1WqydqtpQSAGDTm6Uh60p7UmNGdqEm1D+Vcyw33jV0Op\\/d\\/GufH\\/AB+NUSNFsagby7U0+3UiMVFL\\/wAepqeD\\/Vj6UyTbt+lTXHRfwooqgI5v9SaxZv8AXr9aKKXUZqW33PwpzfeFFFWQXYelTHpRRWcgQ5elOTpRRUsoXvQKKKkB3ametFFAwpkn3aKKcRMgFMbrRRWpmWI\\/9XVG4\\/1wooqUanFeKf8AWR\\/WsvQ\\/+Qrbf9dlooq+hPU9mX\\/Vj6VKvSiiuJ7lo5Hxh\\/r4\\/oK5detFFdEPhGW4elaNr0ooq0RItilooqiUFAoooGD9KgHU0UUgJB0pnc0UUwZKlW0oooJFPWlPaiikxoydT+7+Nc\\/\\/AMvjUUVEjRbGlJ\\/x6mp4P9WPpRRTJP\\/Z\"}', '2026-05-11 12:37:44', '2026-05-11 12:37:44', '2026-05-11 12:37:44', '2026-05-11 12:37:44');

-- --------------------------------------------------------

--
-- Table structure for table `virtual_accounts`
--

CREATE TABLE `virtual_accounts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `provider` varchar(255) NOT NULL DEFAULT 'paystack',
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `account_reference` varchar(255) DEFAULT NULL,
  `reservation_reference` varchar(255) DEFAULT NULL,
  `account_name` varchar(255) DEFAULT NULL,
  `account_number` varchar(255) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `bank_code` varchar(255) DEFAULT NULL,
  `provider_slug` varchar(255) DEFAULT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'NGN',
  `customer_name` varchar(255) DEFAULT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `raw_accounts` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`raw_accounts`)),
  `raw_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`raw_response`)),
  `failure_reason` text DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 0,
  `assigned` tinyint(1) NOT NULL DEFAULT 0,
  `last_synced_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `virtual_accounts`
--

INSERT INTO `virtual_accounts` (`id`, `user_id`, `provider`, `status`, `account_reference`, `reservation_reference`, `account_name`, `account_number`, `bank_name`, `bank_code`, `provider_slug`, `currency`, `customer_name`, `customer_email`, `raw_accounts`, `raw_response`, `failure_reason`, `active`, `assigned`, `last_synced_at`, `created_at`, `updated_at`) VALUES
(1, 2, 'paystack', 'active', '39935594', 'CUS_vwp0385idwyiaeb', 'KENDATINTEGRA/UMAR GADDAFI', '9812903134', 'Wema Bank', '20', 'wema-bank', 'NGN', 'Gaddafi Umar', 'um@gmail.com', '{\"bank\":{\"name\":\"Wema Bank\",\"id\":20,\"slug\":\"wema-bank\"},\"account_name\":\"KENDATINTEGRA\\/UMAR GADDAFI\",\"account_number\":\"9812903134\",\"assigned\":true,\"currency\":\"NGN\",\"metadata\":null,\"active\":true,\"id\":39935594,\"created_at\":\"2026-03-04T20:39:11.000Z\",\"updated_at\":\"2026-05-11T12:41:35.000Z\",\"assignment\":{\"integration\":1152332,\"assignee_id\":363698111,\"assignee_type\":\"Customer\",\"expired\":false,\"account_type\":\"PAY-WITH-TRANSFER-RECURRING\",\"assigned_at\":\"2026-05-11T12:41:35.451Z\",\"expired_at\":null,\"assignment_expires_at\":null},\"customer\":{\"id\":363698111,\"first_name\":\"Gaddafi\",\"last_name\":\"Umar\",\"email\":\"um@gmail.com\",\"customer_code\":\"CUS_vwp0385idwyiaeb\",\"phone\":\"09042340091\",\"metadata\":{\"user_id\":\"2\",\"member_id\":\"MB-1000\"},\"risk_action\":\"default\",\"international_format_phone\":null}}', '{\"bank\":{\"name\":\"Wema Bank\",\"id\":20,\"slug\":\"wema-bank\"},\"account_name\":\"KENDATINTEGRA\\/UMAR GADDAFI\",\"account_number\":\"9812903134\",\"assigned\":true,\"currency\":\"NGN\",\"metadata\":null,\"active\":true,\"id\":39935594,\"created_at\":\"2026-03-04T20:39:11.000Z\",\"updated_at\":\"2026-05-11T12:41:35.000Z\",\"assignment\":{\"integration\":1152332,\"assignee_id\":363698111,\"assignee_type\":\"Customer\",\"expired\":false,\"account_type\":\"PAY-WITH-TRANSFER-RECURRING\",\"assigned_at\":\"2026-05-11T12:41:35.451Z\",\"expired_at\":null,\"assignment_expires_at\":null},\"customer\":{\"id\":363698111,\"first_name\":\"Gaddafi\",\"last_name\":\"Umar\",\"email\":\"um@gmail.com\",\"customer_code\":\"CUS_vwp0385idwyiaeb\",\"phone\":\"09042340091\",\"metadata\":{\"user_id\":\"2\",\"member_id\":\"MB-1000\"},\"risk_action\":\"default\",\"international_format_phone\":null}}', NULL, 1, 1, '2026-05-11 11:41:35', '2026-05-11 11:41:35', '2026-05-11 11:41:35'),
(2, 3, 'paystack', 'active', '39935595', 'CUS_mk4nc420wia0wg7', 'KENDATINTEGRA/MUFTI SHAMAD', '9812903141', 'Wema Bank', '20', 'wema-bank', 'NGN', 'Shamad Mufti', 'umgaddafi6@gmail.com', '{\"bank\":{\"name\":\"Wema Bank\",\"id\":20,\"slug\":\"wema-bank\"},\"account_name\":\"KENDATINTEGRA\\/MUFTI SHAMAD\",\"account_number\":\"9812903141\",\"assigned\":true,\"currency\":\"NGN\",\"metadata\":null,\"active\":true,\"id\":39935595,\"created_at\":\"2026-03-04T20:39:11.000Z\",\"updated_at\":\"2026-05-11T12:41:36.000Z\",\"assignment\":{\"integration\":1152332,\"assignee_id\":363698117,\"assignee_type\":\"Customer\",\"expired\":false,\"account_type\":\"PAY-WITH-TRANSFER-RECURRING\",\"assigned_at\":\"2026-05-11T12:41:36.927Z\",\"expired_at\":null,\"assignment_expires_at\":null},\"customer\":{\"id\":363698117,\"first_name\":\"Shamad\",\"last_name\":\"Mufti\",\"email\":\"umgaddafi6@gmail.com\",\"customer_code\":\"CUS_mk4nc420wia0wg7\",\"phone\":\"09042340091\",\"metadata\":{\"user_id\":\"3\",\"member_id\":\"MB-1001\"},\"risk_action\":\"default\",\"international_format_phone\":null}}', '{\"bank\":{\"name\":\"Wema Bank\",\"id\":20,\"slug\":\"wema-bank\"},\"account_name\":\"KENDATINTEGRA\\/MUFTI SHAMAD\",\"account_number\":\"9812903141\",\"assigned\":true,\"currency\":\"NGN\",\"metadata\":null,\"active\":true,\"id\":39935595,\"created_at\":\"2026-03-04T20:39:11.000Z\",\"updated_at\":\"2026-05-11T12:41:36.000Z\",\"assignment\":{\"integration\":1152332,\"assignee_id\":363698117,\"assignee_type\":\"Customer\",\"expired\":false,\"account_type\":\"PAY-WITH-TRANSFER-RECURRING\",\"assigned_at\":\"2026-05-11T12:41:36.927Z\",\"expired_at\":null,\"assignment_expires_at\":null},\"customer\":{\"id\":363698117,\"first_name\":\"Shamad\",\"last_name\":\"Mufti\",\"email\":\"umgaddafi6@gmail.com\",\"customer_code\":\"CUS_mk4nc420wia0wg7\",\"phone\":\"09042340091\",\"metadata\":{\"user_id\":\"3\",\"member_id\":\"MB-1001\"},\"risk_action\":\"default\",\"international_format_phone\":null}}', NULL, 1, 1, '2026-05-11 11:41:37', '2026-05-11 11:41:36', '2026-05-11 11:41:37'),
(3, 4, 'paystack', 'active', '39935596', 'CUS_jcpfnw2qiod26hg', 'KENDATINTEGRA/UMAR GADDAFI', '9812903158', 'Wema Bank', '20', 'wema-bank', 'NGN', 'GADDAFI UMAR', 'gaddafiumar4445@gmail.com', '{\"bank\":{\"name\":\"Wema Bank\",\"id\":20,\"slug\":\"wema-bank\"},\"account_name\":\"KENDATINTEGRA\\/UMAR GADDAFI\",\"account_number\":\"9812903158\",\"assigned\":true,\"currency\":\"NGN\",\"metadata\":null,\"active\":true,\"id\":39935596,\"created_at\":\"2026-03-04T20:39:11.000Z\",\"updated_at\":\"2026-05-11T12:41:38.000Z\",\"assignment\":{\"integration\":1152332,\"assignee_id\":363698128,\"assignee_type\":\"Customer\",\"expired\":false,\"account_type\":\"PAY-WITH-TRANSFER-RECURRING\",\"assigned_at\":\"2026-05-11T12:41:38.612Z\",\"expired_at\":null,\"assignment_expires_at\":null},\"customer\":{\"id\":363698128,\"first_name\":\"GADDAFI\",\"last_name\":\"UMAR\",\"email\":\"gaddafiumar4445@gmail.com\",\"customer_code\":\"CUS_jcpfnw2qiod26hg\",\"phone\":\"09042340091\",\"metadata\":{\"user_id\":\"4\",\"member_id\":\"MB-1002\"},\"risk_action\":\"default\",\"international_format_phone\":null}}', '{\"bank\":{\"name\":\"Wema Bank\",\"id\":20,\"slug\":\"wema-bank\"},\"account_name\":\"KENDATINTEGRA\\/UMAR GADDAFI\",\"account_number\":\"9812903158\",\"assigned\":true,\"currency\":\"NGN\",\"metadata\":null,\"active\":true,\"id\":39935596,\"created_at\":\"2026-03-04T20:39:11.000Z\",\"updated_at\":\"2026-05-11T12:41:38.000Z\",\"assignment\":{\"integration\":1152332,\"assignee_id\":363698128,\"assignee_type\":\"Customer\",\"expired\":false,\"account_type\":\"PAY-WITH-TRANSFER-RECURRING\",\"assigned_at\":\"2026-05-11T12:41:38.612Z\",\"expired_at\":null,\"assignment_expires_at\":null},\"customer\":{\"id\":363698128,\"first_name\":\"GADDAFI\",\"last_name\":\"UMAR\",\"email\":\"gaddafiumar4445@gmail.com\",\"customer_code\":\"CUS_jcpfnw2qiod26hg\",\"phone\":\"09042340091\",\"metadata\":{\"user_id\":\"4\",\"member_id\":\"MB-1002\"},\"risk_action\":\"default\",\"international_format_phone\":null}}', NULL, 1, 1, '2026-05-11 11:41:38', '2026-05-11 11:41:37', '2026-05-11 11:41:38'),
(4, 5, 'paystack', 'active', '39935616', 'CUS_dnz05uhzrxd4rl4', 'KENDATINTEGRA/MUFTI SHAMAD', '9812903354', 'Wema Bank', '20', 'wema-bank', 'NGN', 'Shamad Mufti', 'umgaddafi1@gmail.com', '{\"bank\":{\"name\":\"Wema Bank\",\"id\":20,\"slug\":\"wema-bank\"},\"account_name\":\"KENDATINTEGRA\\/MUFTI SHAMAD\",\"account_number\":\"9812903354\",\"assigned\":true,\"currency\":\"NGN\",\"metadata\":null,\"active\":true,\"id\":39935616,\"created_at\":\"2026-03-04T20:39:11.000Z\",\"updated_at\":\"2026-05-11T12:47:09.000Z\",\"assignment\":{\"integration\":1152332,\"assignee_id\":363699599,\"assignee_type\":\"Customer\",\"expired\":false,\"account_type\":\"PAY-WITH-TRANSFER-RECURRING\",\"assigned_at\":\"2026-05-11T12:47:09.444Z\",\"expired_at\":null,\"assignment_expires_at\":null},\"customer\":{\"id\":363699599,\"first_name\":\"Shamad\",\"last_name\":\"Mufti\",\"email\":\"umgaddafi1@gmail.com\",\"customer_code\":\"CUS_dnz05uhzrxd4rl4\",\"phone\":\"09042340091\",\"metadata\":{\"user_id\":\"5\",\"member_id\":\"MB-1003\"},\"risk_action\":\"default\",\"international_format_phone\":null}}', '{\"bank\":{\"name\":\"Wema Bank\",\"id\":20,\"slug\":\"wema-bank\"},\"account_name\":\"KENDATINTEGRA\\/MUFTI SHAMAD\",\"account_number\":\"9812903354\",\"assigned\":true,\"currency\":\"NGN\",\"metadata\":null,\"active\":true,\"id\":39935616,\"created_at\":\"2026-03-04T20:39:11.000Z\",\"updated_at\":\"2026-05-11T12:47:09.000Z\",\"assignment\":{\"integration\":1152332,\"assignee_id\":363699599,\"assignee_type\":\"Customer\",\"expired\":false,\"account_type\":\"PAY-WITH-TRANSFER-RECURRING\",\"assigned_at\":\"2026-05-11T12:47:09.444Z\",\"expired_at\":null,\"assignment_expires_at\":null},\"customer\":{\"id\":363699599,\"first_name\":\"Shamad\",\"last_name\":\"Mufti\",\"email\":\"umgaddafi1@gmail.com\",\"customer_code\":\"CUS_dnz05uhzrxd4rl4\",\"phone\":\"09042340091\",\"metadata\":{\"user_id\":\"5\",\"member_id\":\"MB-1003\"},\"risk_action\":\"default\",\"international_format_phone\":null}}', NULL, 1, 1, '2026-05-11 12:04:49', '2026-05-11 11:47:08', '2026-05-11 12:04:49'),
(5, 6, 'paystack', 'active', '39935840', 'CUS_4zz3k7w5a3athet', 'KENDATINTEGRA/ADEFEMI KEHINDE', '9812905592', 'Wema Bank', '20', 'wema-bank', 'NGN', 'kehinde adefemi', 'accestoreng@gmail.com', '{\"bank\":{\"name\":\"Wema Bank\",\"id\":20,\"slug\":\"wema-bank\"},\"account_name\":\"KENDATINTEGRA\\/ADEFEMI KEHINDE\",\"account_number\":\"9812905592\",\"assigned\":true,\"currency\":\"NGN\",\"metadata\":null,\"active\":true,\"id\":39935840,\"created_at\":\"2026-03-04T20:39:15.000Z\",\"updated_at\":\"2026-05-11T13:44:59.000Z\",\"assignment\":{\"integration\":1152332,\"assignee_id\":363715776,\"assignee_type\":\"Customer\",\"expired\":false,\"account_type\":\"PAY-WITH-TRANSFER-RECURRING\",\"assigned_at\":\"2026-05-11T13:44:59.614Z\",\"expired_at\":null,\"assignment_expires_at\":null},\"customer\":{\"id\":363715776,\"first_name\":\"kehinde\",\"last_name\":\"adefemi\",\"email\":\"accestoreng@gmail.com\",\"customer_code\":\"CUS_4zz3k7w5a3athet\",\"phone\":\"07038367322\",\"metadata\":{\"user_id\":\"6\",\"member_id\":\"MB-1004\"},\"risk_action\":\"default\",\"international_format_phone\":null}}', '{\"bank\":{\"name\":\"Wema Bank\",\"id\":20,\"slug\":\"wema-bank\"},\"account_name\":\"KENDATINTEGRA\\/ADEFEMI KEHINDE\",\"account_number\":\"9812905592\",\"assigned\":true,\"currency\":\"NGN\",\"metadata\":null,\"active\":true,\"id\":39935840,\"created_at\":\"2026-03-04T20:39:15.000Z\",\"updated_at\":\"2026-05-11T13:44:59.000Z\",\"assignment\":{\"integration\":1152332,\"assignee_id\":363715776,\"assignee_type\":\"Customer\",\"expired\":false,\"account_type\":\"PAY-WITH-TRANSFER-RECURRING\",\"assigned_at\":\"2026-05-11T13:44:59.614Z\",\"expired_at\":null,\"assignment_expires_at\":null},\"customer\":{\"id\":363715776,\"first_name\":\"kehinde\",\"last_name\":\"adefemi\",\"email\":\"accestoreng@gmail.com\",\"customer_code\":\"CUS_4zz3k7w5a3athet\",\"phone\":\"07038367322\",\"metadata\":{\"user_id\":\"6\",\"member_id\":\"MB-1004\"},\"risk_action\":\"default\",\"international_format_phone\":null}}', NULL, 1, 1, '2026-05-11 12:44:59', '2026-05-11 12:44:59', '2026-05-11 12:44:59'),
(6, 7, 'paystack', 'active', '39938848', 'CUS_x37ky9tly04wiqb', 'KENDATINTEGRA/TEST SMOKE', '9812935672', 'Wema Bank', '20', 'wema-bank', 'NGN', 'Smoke Test', 'smoke1778587227@example.com', '{\"bank\":{\"name\":\"Wema Bank\",\"id\":20,\"slug\":\"wema-bank\"},\"account_name\":\"KENDATINTEGRA\\/TEST SMOKE\",\"account_number\":\"9812935672\",\"assigned\":true,\"currency\":\"NGN\",\"metadata\":null,\"active\":true,\"id\":39938848,\"created_at\":\"2026-03-04T20:39:56.000Z\",\"updated_at\":\"2026-05-12T12:00:34.000Z\",\"assignment\":{\"integration\":1152332,\"assignee_id\":363963044,\"assignee_type\":\"Customer\",\"expired\":false,\"account_type\":\"PAY-WITH-TRANSFER-RECURRING\",\"assigned_at\":\"2026-05-12T12:00:34.032Z\",\"expired_at\":null,\"assignment_expires_at\":null},\"customer\":{\"id\":363963044,\"first_name\":\"Smoke\",\"last_name\":\"Test\",\"email\":\"smoke1778587227@example.com\",\"customer_code\":\"CUS_x37ky9tly04wiqb\",\"phone\":\"08012345678\",\"metadata\":{\"user_id\":\"7\",\"member_id\":\"MB-1005\"},\"risk_action\":\"default\",\"international_format_phone\":null}}', '{\"bank\":{\"name\":\"Wema Bank\",\"id\":20,\"slug\":\"wema-bank\"},\"account_name\":\"KENDATINTEGRA\\/TEST SMOKE\",\"account_number\":\"9812935672\",\"assigned\":true,\"currency\":\"NGN\",\"metadata\":null,\"active\":true,\"id\":39938848,\"created_at\":\"2026-03-04T20:39:56.000Z\",\"updated_at\":\"2026-05-12T12:00:34.000Z\",\"assignment\":{\"integration\":1152332,\"assignee_id\":363963044,\"assignee_type\":\"Customer\",\"expired\":false,\"account_type\":\"PAY-WITH-TRANSFER-RECURRING\",\"assigned_at\":\"2026-05-12T12:00:34.032Z\",\"expired_at\":null,\"assignment_expires_at\":null},\"customer\":{\"id\":363963044,\"first_name\":\"Smoke\",\"last_name\":\"Test\",\"email\":\"smoke1778587227@example.com\",\"customer_code\":\"CUS_x37ky9tly04wiqb\",\"phone\":\"08012345678\",\"metadata\":{\"user_id\":\"7\",\"member_id\":\"MB-1005\"},\"risk_action\":\"default\",\"international_format_phone\":null}}', NULL, 1, 1, '2026-05-12 11:00:34', '2026-05-12 11:00:32', '2026-05-12 11:00:34'),
(7, 1, 'paystack', 'active', '39946530', 'CUS_ycl04uov2s40am9', 'KENDATINTEGRA/OFFICER ADMIN', '9813012495', 'Wema Bank', '20', 'wema-bank', 'NGN', 'Admin Officer', 'admin@idmeservices.com.ng', '{\"bank\":{\"name\":\"Wema Bank\",\"id\":20,\"slug\":\"wema-bank\"},\"account_name\":\"KENDATINTEGRA\\/OFFICER ADMIN\",\"account_number\":\"9813012495\",\"assigned\":true,\"currency\":\"NGN\",\"metadata\":null,\"active\":true,\"id\":39946530,\"created_at\":\"2026-03-04T20:41:46.000Z\",\"updated_at\":\"2026-05-14T14:37:17.000Z\",\"assignment\":{\"integration\":1152332,\"assignee_id\":364615840,\"assignee_type\":\"Customer\",\"expired\":false,\"account_type\":\"PAY-WITH-TRANSFER-RECURRING\",\"assigned_at\":\"2026-05-14T14:37:17.884Z\",\"expired_at\":null,\"assignment_expires_at\":null},\"customer\":{\"id\":364615840,\"first_name\":\"Admin\",\"last_name\":\"Officer\",\"email\":\"admin@idmeservices.com.ng\",\"customer_code\":\"CUS_ycl04uov2s40am9\",\"phone\":\"08000000000\",\"metadata\":{\"user_id\":\"1\",\"member_id\":\"ADM-0001\"},\"risk_action\":\"default\",\"international_format_phone\":null}}', '{\"bank\":{\"name\":\"Wema Bank\",\"id\":20,\"slug\":\"wema-bank\"},\"account_name\":\"KENDATINTEGRA\\/OFFICER ADMIN\",\"account_number\":\"9813012495\",\"assigned\":true,\"currency\":\"NGN\",\"metadata\":null,\"active\":true,\"id\":39946530,\"created_at\":\"2026-03-04T20:41:46.000Z\",\"updated_at\":\"2026-05-14T14:37:17.000Z\",\"assignment\":{\"integration\":1152332,\"assignee_id\":364615840,\"assignee_type\":\"Customer\",\"expired\":false,\"account_type\":\"PAY-WITH-TRANSFER-RECURRING\",\"assigned_at\":\"2026-05-14T14:37:17.884Z\",\"expired_at\":null,\"assignment_expires_at\":null},\"customer\":{\"id\":364615840,\"first_name\":\"Admin\",\"last_name\":\"Officer\",\"email\":\"admin@idmeservices.com.ng\",\"customer_code\":\"CUS_ycl04uov2s40am9\",\"phone\":\"08000000000\",\"metadata\":{\"user_id\":\"1\",\"member_id\":\"ADM-0001\"},\"risk_action\":\"default\",\"international_format_phone\":null}}', NULL, 1, 1, '2026-05-14 13:37:18', '2026-05-14 13:37:16', '2026-05-14 13:37:18');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `api_tokens`
--
ALTER TABLE `api_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `api_tokens_token_hash_unique` (`token_hash`),
  ADD KEY `api_tokens_user_id_foreign` (`user_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_actor_user_id_foreign` (`actor_user_id`),
  ADD KEY `audit_logs_target_user_id_foreign` (`target_user_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `paystack_webhook_events`
--
ALTER TABLE `paystack_webhook_events`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `paystack_webhook_events_reference_unique` (`reference`),
  ADD KEY `paystack_webhook_events_event_index` (`event`),
  ADD KEY `paystack_webhook_events_account_number_index` (`account_number`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `services_slug_unique` (`slug`);

--
-- Indexes for table `service_requests`
--
ALTER TABLE `service_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `service_requests_reference_unique` (`reference`),
  ADD KEY `service_requests_user_id_foreign` (`user_id`),
  ADD KEY `service_requests_reviewed_by_user_id_foreign` (`reviewed_by_user_id`);

--
-- Indexes for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `support_tickets_user_id_foreign` (`user_id`),
  ADD KEY `support_tickets_assigned_admin_id_foreign` (`assigned_admin_id`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transactions_reference_unique` (`reference`),
  ADD KEY `transactions_user_id_foreign` (`user_id`),
  ADD KEY `transactions_verification_id_foreign` (`verification_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_member_id_unique` (`member_id`),
  ADD UNIQUE KEY `users_wallet_reference_unique` (`wallet_reference`),
  ADD KEY `users_paystack_customer_id_index` (`paystack_customer_id`),
  ADD KEY `users_paystack_customer_code_index` (`paystack_customer_code`);

--
-- Indexes for table `verifications`
--
ALTER TABLE `verifications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `verifications_reference_unique` (`reference`),
  ADD KEY `verifications_user_id_foreign` (`user_id`),
  ADD KEY `verifications_reviewed_by_user_id_foreign` (`reviewed_by_user_id`);

--
-- Indexes for table `virtual_accounts`
--
ALTER TABLE `virtual_accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `virtual_accounts_provider_account_number_unique` (`provider`,`account_number`),
  ADD KEY `virtual_accounts_user_id_foreign` (`user_id`),
  ADD KEY `virtual_accounts_provider_index` (`provider`),
  ADD KEY `virtual_accounts_status_index` (`status`),
  ADD KEY `virtual_accounts_account_reference_index` (`account_reference`),
  ADD KEY `virtual_accounts_reservation_reference_index` (`reservation_reference`),
  ADD KEY `virtual_accounts_provider_slug_index` (`provider_slug`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `api_tokens`
--
ALTER TABLE `api_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `paystack_webhook_events`
--
ALTER TABLE `paystack_webhook_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `service_requests`
--
ALTER TABLE `service_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `support_tickets`
--
ALTER TABLE `support_tickets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `verifications`
--
ALTER TABLE `verifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `virtual_accounts`
--
ALTER TABLE `virtual_accounts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `api_tokens`
--
ALTER TABLE `api_tokens`
  ADD CONSTRAINT `api_tokens_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_actor_user_id_foreign` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `audit_logs_target_user_id_foreign` FOREIGN KEY (`target_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `service_requests`
--
ALTER TABLE `service_requests`
  ADD CONSTRAINT `service_requests_reviewed_by_user_id_foreign` FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `service_requests_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD CONSTRAINT `support_tickets_assigned_admin_id_foreign` FOREIGN KEY (`assigned_admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `support_tickets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transactions_verification_id_foreign` FOREIGN KEY (`verification_id`) REFERENCES `verifications` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `verifications`
--
ALTER TABLE `verifications`
  ADD CONSTRAINT `verifications_reviewed_by_user_id_foreign` FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `verifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `virtual_accounts`
--
ALTER TABLE `virtual_accounts`
  ADD CONSTRAINT `virtual_accounts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;




