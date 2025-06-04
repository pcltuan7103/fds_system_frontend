import {
    CampaignIcon,
    CertificateIcon,
    ManageIcon,
    MenuIcon,
    NewsIcon,
    NotificationIcon,
    PostIcon,
} from "@/assets/icons";
import { navigateHook } from "@/routes/RouteApp";
import { routes } from "@/routes/routeName";
import { FC, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    CreateCampaignModal,
    CreateRequestSupportModal,
    DonorGuideModal,
    RecipientGuideModal,
    SubmitCertificateModal,
} from "../Modal";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
    selectGetProfileUser,
    selectIsAuthenticated,
    selectNotifications,
    selectUserLogin,
} from "@/app/selector";
import { logout } from "@/utils/helper";
import connection, { startConnection } from "@/signalRService";
import { toast } from "react-toastify";
import { getProfileApiThunk } from "@/services/user/userThunk";
import {
    addNotification,
    setNotifications,
} from "@/services/notification/notificationSlice";
import { readNotificationApiThunk } from "@/services/notification/notificationThunk";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { LogoLanding } from "@/assets/images";
import classNames from "classnames";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("vi");
dayjs.extend(relativeTime);

const HeaderLanding: FC<LandingHeaderProps> = ({ isLogin }) => {
    const dispatch = useAppDispatch();
    const location = useLocation();

    const userLogin = useAppSelector(selectUserLogin);

    const profileUser = useAppSelector(selectGetProfileUser);

    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    const [isSubMenuProfileOpen, setIsSubMenuProfileOpen] = useState(false);

    const [isSubmitCertificateModalOpen, setIsSubmitCertificateModalOpen] =
        useState(false);

    const [isCreateCampaignModalOpen, setIsCreateCampaignModalOpen] =
        useState(false);

    const [isRequestSupportModalOpen, setIsRequestSupportModalOpen] =
        useState(false);

    const [isDonorGuildModalOpen, setIsDonorGuildModalOpen] = useState(false);

    const [isRecipientGuildModalOpen, setIsRecipientGuildModalOpen] =
        useState(false);

    const handleCreateCampaign = () => {
        if (profileUser?.isConfirm === false) {
            setIsSubmitCertificateModalOpen(true);
        }
        if (profileUser?.isConfirm === true) {
            setIsCreateCampaignModalOpen(true);
        }
    };

    const handleRequestSupport = () => {
        setIsRequestSupportModalOpen(true);
    };

    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifications = useAppSelector(selectNotifications);

    const handleNewNotification = (notification: any) => {
        const correctedNotification: NotificationDto = {
            ...notification,
            notificationId:
                notification.notificationId ||
                notification.id ||
                notification._id,
            objectId: notification.objectId || notification.ojectId,
        };

        dispatch(addNotification(correctedNotification));
        toast.info(`🔔 ${correctedNotification.content}`);
    };

    useEffect(() => {
        if (!isAuthenticated) return;

        // Kiểm tra xem kết nối SignalR có tồn tại không, nếu không, tạo kết nối mới
        if (!connection?.state || connection?.state === "Disconnected") {
            startConnection(); // Tạo kết nối nếu chưa có
        }

        // Đăng ký các sự kiện SignalR
        connection.on("ReceiveNotification", handleNewNotification);
        connection.on("LoadOldNotifications", (oldNotifications: any[]) => {
            dispatch(
                setNotifications(
                    oldNotifications.map((notif) => ({
                        ...notif,
                        notificationId:
                            notif.notificationId || notif.id || notif._id,
                        ojectId: notif.ojectId || notif.ojectId,
                    }))
                )
            );
        });

        return () => {
            // Ngắt kết nối khi component unmount
            connection.off("ReceiveNotification", handleNewNotification);
            connection.off("LoadOldNotifications");
        };
    }, [isAuthenticated, connection]); // Thêm connection vào dependency array

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(getProfileApiThunk(String(userLogin?.accountId))).unwrap();
        }
    }, [isAuthenticated]);

    const unreadCount = notifications.filter((notif) => !notif.isRead).length;

    const unReadCampaignCount = notifications.filter((notif) =>
        ["Campaign", "RegisterReceiver"].includes(notif.objectType)
    ).length;

    const unReadCertificateCount = notifications.filter((notif) =>
        [
            "Personal Donor Certificate",
            "Organization Donor Certificate",
            "Recipient Certificate",
        ].includes(notif.objectType)
    ).length;

    const unReadNewsCount = notifications.filter(
        (notif) => notif.objectType === "New"
    ).length;

    const unReadPostCount = notifications.filter(
        (notif) => notif.objectType === "Post"
    ).length;

    const toggleNotifications = () => {
        setIsNotifOpen((prev) => !prev);
    };

    const markAsRead = (notificationId: string) => {
        // Cập nhật UI ngay lập tức
        dispatch(
            setNotifications(
                notifications.map((notification) =>
                    notification.notificationId === notificationId
                        ? { ...notification, isRead: true }
                        : notification
                )
            )
        );

        // Gọi API và xử lý kết quả
        dispatch(readNotificationApiThunk(notificationId))
            .unwrap() // Lấy kết quả trả về nếu thành công
            .then(() => {
                // Cập nhật lại trong Redux khi API thành công
                dispatch(
                    setNotifications(
                        notifications.map((notification) =>
                            notification.notificationId === notificationId
                                ? { ...notification, isRead: true }
                                : notification
                        )
                    )
                );
                setIsNotifOpen(false);
            })
            .catch(() => {});

        setIsNotifOpen(false);
    };

    const menuItems = [
        {
            name: "Chiến dịch",
            active: location.pathname === routes.user.campaign.list,
            subMenu: [
                { title: "Tất cả", to: routes.user.campaign.list },
                { title: "Tổ chức", to: `${routes.user.campaign.list}?tab=2` },
                { title: "Cá nhân", to: `${routes.user.campaign.list}?tab=1` },
            ],
        },
        {
            name: "Khám phá",
            active:
                location.pathname === routes.user.news.list ||
                location.pathname === routes.user.post.forum,
            subMenu: [
                { title: "Tin tức", to: routes.user.news.list },
                { title: "Bản tin", to: routes.user.post.forum },
            ],
        },
        {
            name: "Giới thiệu",
            subMenu: [
                { title: "Về chúng tôi", to: routes.about },
                { title: "Liên hệ", to: routes.contact },
                ...(userLogin?.roleId === 3 && isAuthenticated
                    ? [{ title: "Ủng hộ chúng tôi", to: routes.user.donate }]
                    : []),
            ],
        },
    ];

    const handleToDetailCampaign = (campaignId: string, type: string) => {
        if (type === "Notification") {
            const url = routes.user.campaign.detail.replace(":id", campaignId);
            return navigateHook(url);
        } else {
            const url = routes.user.detail_campaign.replace(":id", campaignId);
            return navigateHook(url);
        }
    };

    const handleGoToRequestSupport = (requestSupportId: string) => {
        const url = routes.user.participate_request_support.replace(
            ":id",
            requestSupportId
        );
        return navigateHook(url);
    };

    const handleToDetailCertificate = (
        certificateId?: string,
        type?: string
    ) => {
        if (!certificateId) {
            return;
        }

        if (!type) {
            return;
        }

        const url = routes.user.detail_certificate.replace(
            ":id",
            certificateId
        );
        const fullUrl = `${url}?type=${encodeURIComponent(type)}`;

        navigateHook(fullUrl);
    };

    const handleToDetailNews = (NewsId: string) => {
        const url = routes.user.news.detail.replace(":id", NewsId);
        return navigateHook(url);
    };

    const handleToPost = () => {
        const url = routes.user.post.forum;
        return navigateHook(url);
    };

    const [notificationTab, setNotificationTab] = useState("chiendich");

    return (
        <header id="header-landing">
            <div className="hl-container">
                <div className="hlcc1">
                    <img
                        src={LogoLanding}
                        onClick={() => navigateHook(routes.user.home)}
                    />
                </div>
                <div className="hlcc2">
                    <ul className="nav-list">
                        {menuItems.map((item, index) => (
                            <li
                                key={index}
                                className="nav-item"
                                onMouseEnter={() => setHoverIndex(index)}
                                onMouseLeave={() => setHoverIndex(null)}
                            >
                                <p
                                    className={classNames("nav-link", {
                                        "nav-link-active": item.active === true,
                                    })}
                                >
                                    {item.name}
                                </p>
                                {hoverIndex === index &&
                                    item.subMenu.length > 0 && (
                                        <ul className="sub-menu">
                                            {item.subMenu.map((sub, i) => (
                                                <li
                                                    key={i}
                                                    className={classNames(
                                                        "sub-item",
                                                        {
                                                            "sub-item-active":
                                                                location.pathname ===
                                                                sub.to.split(
                                                                    "?"
                                                                )[0],
                                                        }
                                                    )}
                                                >
                                                    {typeof sub === "string" ? (
                                                        <span>{sub}</span>
                                                    ) : (
                                                        <Link
                                                            to={sub.to || "#"}
                                                        >
                                                            {sub.title}
                                                        </Link>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="hlcc3">
                    {!isLogin && (
                        <>
                            <button
                                className="sc-btn"
                                onClick={() => navigateHook(routes.login)}
                            >
                                Đăng nhập
                            </button>
                            <button
                                className="pr-btn"
                                onClick={() => navigateHook(routes.register)}
                            >
                                Đăng ký
                            </button>
                            <Link to={routes.admin_login}>
                                <ManageIcon className="manage-icon" />
                                Trang quản lý
                            </Link>
                        </>
                    )}
                    {isLogin && (
                        <>
                            {userLogin?.roleId === 3 &&
                                (profileUser?.isConfirm === true ? (
                                    <button
                                        onClick={handleCreateCampaign}
                                        className="sc-btn"
                                    >
                                        Tạo chiến dịch
                                    </button>
                                ) : (
                                    <p
                                        className="note"
                                        onClick={() =>
                                            setIsDonorGuildModalOpen(true)
                                        }
                                    >
                                        Tài khoản chưa được xác thực
                                    </p>
                                ))}
                            {userLogin?.roleId === 4 &&
                                (profileUser?.isConfirm === false ? (
                                    <p
                                        className="note"
                                        onClick={() =>
                                            setIsRecipientGuildModalOpen(true)
                                        }
                                    >
                                        Tài khoản chưa được xác thực
                                    </p>
                                ) : (
                                    <button
                                        onClick={handleRequestSupport}
                                        className="sc-btn"
                                    >
                                        Yêu cầu hỗ trợ
                                    </button>
                                ))}
                            <div className="notification-wrapper">
                                <div className="notification-icon-wrapper">
                                    <NotificationIcon
                                        width={30}
                                        height={30}
                                        className="menu-icon"
                                        onClick={toggleNotifications}
                                    />
                                    {unreadCount > 0 && (
                                        <span className="notification-badge">
                                            {unreadCount > 9
                                                ? "9+"
                                                : unreadCount}
                                        </span>
                                    )}
                                </div>
                                {isNotifOpen && (
                                    <div className="notification-dropdown">
                                        <div className="nd-tabs">
                                            <div
                                                className={`nd-tabs-item ${
                                                    notificationTab ===
                                                    "chiendich"
                                                        ? "nd-tabs-item-actived"
                                                        : ""
                                                }`}
                                                onClick={() => {
                                                    setNotificationTab(
                                                        "chiendich"
                                                    );
                                                }}
                                            >
                                                Chiến dịch
                                                {unReadCampaignCount > 0 && (
                                                    <span className="notification-badge">
                                                        {unReadCampaignCount > 9
                                                            ? "9+"
                                                            : unReadCampaignCount}
                                                    </span>
                                                )}
                                            </div>
                                            <div
                                                className={`nd-tabs-item ${
                                                    notificationTab ===
                                                    "chungnhan"
                                                        ? "nd-tabs-item-actived"
                                                        : ""
                                                }`}
                                                onClick={() => {
                                                    setNotificationTab(
                                                        "chungnhan"
                                                    );
                                                }}
                                            >
                                                Chứng nhận
                                                {unReadCertificateCount > 0 && (
                                                    <span className="notification-badge">
                                                        {unReadCertificateCount >
                                                        9
                                                            ? "9+"
                                                            : unReadCertificateCount}
                                                    </span>
                                                )}
                                            </div>
                                            <div
                                                className={`nd-tabs-item ${
                                                    notificationTab === "tintuc"
                                                        ? "nd-tabs-item-actived"
                                                        : ""
                                                }`}
                                                onClick={() => {
                                                    setNotificationTab(
                                                        "tintuc"
                                                    );
                                                }}
                                            >
                                                Tin tức
                                                {unReadNewsCount > 0 && (
                                                    <span className="notification-badge">
                                                        {unReadNewsCount > 9
                                                            ? "9+"
                                                            : unReadNewsCount}
                                                    </span>
                                                )}
                                            </div>
                                            <div
                                                className={`nd-tabs-item ${
                                                    notificationTab ===
                                                    "baiviet"
                                                        ? "nd-tabs-item-actived"
                                                        : ""
                                                }`}
                                                onClick={() => {
                                                    setNotificationTab(
                                                        "baiviet"
                                                    );
                                                }}
                                            >
                                                Bài viết
                                                {unReadPostCount > 0 && (
                                                    <span className="notification-badge">
                                                        {unReadPostCount > 9
                                                            ? "9+"
                                                            : unReadPostCount}
                                                    </span>
                                                )}
                                            </div>
                                            <div
                                                className={`nd-tabs-item ${
                                                    notificationTab === "yeucau"
                                                        ? "nd-tabs-item-actived"
                                                        : ""
                                                }`}
                                                onClick={() => {
                                                    setNotificationTab(
                                                        "yeucau"
                                                    );
                                                }}
                                            >
                                                Yêu cầu hỗ trợ
                                            </div>
                                        </div>
                                        {notifications.length > 0 ? (
                                            notifications.map((notif) => {
                                                switch (notif.objectType) {
                                                    case "RegisterReceiver":
                                                        if (
                                                            notificationTab ===
                                                            "chiendich"
                                                        ) {
                                                            let actionText = "";
                                                            if (
                                                                notif.notificationType ===
                                                                "Pending"
                                                            )
                                                                actionText =
                                                                    "Có người đăng ký chiến dịch của bạn.";

                                                            if (actionText) {
                                                                return (
                                                                    <div
                                                                        key={
                                                                            notif.notificationId
                                                                        }
                                                                        className={`notification-item ${
                                                                            notif.isRead
                                                                                ? "read"
                                                                                : "unread"
                                                                        }`}
                                                                        onClick={() => {
                                                                            markAsRead(
                                                                                notif.notificationId
                                                                            );
                                                                            handleToDetailCampaign(
                                                                                notif.ojectId ||
                                                                                    "",
                                                                                notif.notificationType
                                                                            );
                                                                        }}
                                                                    >
                                                                        <CampaignIcon className="notification-icon" />
                                                                        <div>
                                                                            <strong>
                                                                                {
                                                                                    notif.content
                                                                                }
                                                                            </strong>
                                                                            <p>
                                                                                {
                                                                                    actionText
                                                                                }
                                                                            </p>
                                                                            <p>
                                                                                {notif?.createdDate
                                                                                    ? dayjs
                                                                                          .utc(
                                                                                              notif.createdDate
                                                                                          )
                                                                                          .tz(
                                                                                              "Asia/Ho_Chi_Minh"
                                                                                          )
                                                                                          .fromNow()
                                                                                    : ""}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                                                        }
                                                        return null;
                                                    case "Yêu cầu hỗ trợ":
                                                        if (
                                                            notificationTab ===
                                                            "yeucau"
                                                        ) {
                                                            let actionText = "";
                                                            if (
                                                                notif.notificationType ===
                                                                "Gửi yêu cầu"
                                                            )
                                                                actionText =
                                                                    "Có yêu cầu hỗ trợ đã được gửi đến bạn.";

                                                            if (actionText) {
                                                                return (
                                                                    <div
                                                                        key={
                                                                            notif.notificationId
                                                                        }
                                                                        className={`notification-item ${
                                                                            notif.isRead
                                                                                ? "read"
                                                                                : "unread"
                                                                        }`}
                                                                        onClick={() => {
                                                                            markAsRead(
                                                                                notif.notificationId
                                                                            );
                                                                            handleGoToRequestSupport(
                                                                                notif.ojectId
                                                                            );
                                                                        }}
                                                                    >
                                                                        <PostIcon className="notification-icon" />
                                                                        <div>
                                                                            <strong>
                                                                                {
                                                                                    actionText
                                                                                }
                                                                            </strong>
                                                                            <p>
                                                                                Xem
                                                                                chi
                                                                                tiết
                                                                            </p>
                                                                            <p>
                                                                                {notif?.createdDate
                                                                                    ? dayjs
                                                                                          .utc(
                                                                                              notif.createdDate
                                                                                          )
                                                                                          .tz(
                                                                                              "Asia/Ho_Chi_Minh"
                                                                                          )
                                                                                          .fromNow()
                                                                                    : ""}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                                                        }
                                                        return null;
                                                    case "Campaign":
                                                        if (
                                                            notificationTab ===
                                                            "chiendich"
                                                        ) {
                                                            let actionText = "";
                                                            if (
                                                                notif.notificationType ===
                                                                "Approve"
                                                            )
                                                                actionText =
                                                                    "Chiến dịch đã được phê duyệt.";
                                                            if (
                                                                notif.notificationType ===
                                                                "Pending"
                                                            )
                                                                actionText =
                                                                    "Có chiến dịch mới được tạo ra.";
                                                            if (
                                                                notif.notificationType ===
                                                                "Reject"
                                                            )
                                                                actionText =
                                                                    "Chiến dịch đã bị từ chối.";
                                                            if (
                                                                notif.notificationType ===
                                                                "Review"
                                                            )
                                                                actionText =
                                                                    "Chiến dịch đang chờ xem xét.";
                                                            if (
                                                                notif.notificationType ===
                                                                "Notification"
                                                            )
                                                                actionText =
                                                                    "Có một chiến dịch vừa được tạo.";
                                                            if (
                                                                notif.notificationType ===
                                                                "Cancel"
                                                            )
                                                                actionText =
                                                                    "Chiến dịch vừa bị huỷ.";

                                                            if (actionText) {
                                                                return (
                                                                    <div
                                                                        key={
                                                                            notif.notificationId
                                                                        }
                                                                        className={`notification-item ${
                                                                            notif.isRead
                                                                                ? "read"
                                                                                : "unread"
                                                                        }`}
                                                                        onClick={() => {
                                                                            markAsRead(
                                                                                notif.notificationId
                                                                            );
                                                                            handleToDetailCampaign(
                                                                                notif.ojectId ||
                                                                                    "",
                                                                                notif.notificationType
                                                                            );
                                                                        }}
                                                                    >
                                                                        <CampaignIcon className="notification-icon" />
                                                                        <div>
                                                                            <strong>
                                                                                {
                                                                                    notif.content
                                                                                }
                                                                            </strong>
                                                                            <p>
                                                                                {
                                                                                    actionText
                                                                                }
                                                                            </p>
                                                                            <p>
                                                                                {notif?.createdDate
                                                                                    ? dayjs
                                                                                          .utc(
                                                                                              notif.createdDate
                                                                                          )
                                                                                          .tz(
                                                                                              "Asia/Ho_Chi_Minh"
                                                                                          )
                                                                                          .fromNow()
                                                                                    : ""}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                                                        }
                                                        return null;

                                                    case "Post":
                                                        if (
                                                            notificationTab ===
                                                            "baiviet"
                                                        ) {
                                                            let actionText = "";
                                                            if (
                                                                notif.notificationType ===
                                                                "Approve"
                                                            )
                                                                actionText =
                                                                    "Bài viết của bạn được phê duyệt.";
                                                            if (
                                                                notif.notificationType ===
                                                                "Reject"
                                                            )
                                                                actionText =
                                                                    "Bài viết của bạn đã bị từ chối.";
                                                            if (
                                                                notif.notificationType ===
                                                                "Like"
                                                            )
                                                                actionText =
                                                                    "Có người thích bài viết của bạn.";
                                                            if (
                                                                notif.notificationType ===
                                                                "Comment"
                                                            )
                                                                actionText =
                                                                    "Có người thích bình luận bài viết của bạn.";

                                                            if (actionText) {
                                                                return (
                                                                    <div
                                                                        key={
                                                                            notif.notificationId
                                                                        }
                                                                        className={`notification-item ${
                                                                            notif.isRead
                                                                                ? "read"
                                                                                : "unread"
                                                                        }`}
                                                                        onClick={() => {
                                                                            markAsRead(
                                                                                notif.notificationId
                                                                            );
                                                                            handleToPost();
                                                                        }}
                                                                    >
                                                                        <PostIcon className="notification-icon" />
                                                                        <div>
                                                                            <strong>
                                                                                {
                                                                                    notif.content
                                                                                }
                                                                            </strong>
                                                                            <p>
                                                                                {
                                                                                    actionText
                                                                                }
                                                                            </p>
                                                                            <p>
                                                                                {notif?.createdDate
                                                                                    ? dayjs
                                                                                          .utc(
                                                                                              notif.createdDate
                                                                                          )
                                                                                          .tz(
                                                                                              "Asia/Ho_Chi_Minh"
                                                                                          )
                                                                                          .fromNow()
                                                                                    : ""}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                                                        }
                                                        return null;

                                                    case "New":
                                                        if (
                                                            notificationTab ===
                                                            "tintuc"
                                                        ) {
                                                            return (
                                                                <div
                                                                    key={
                                                                        notif.notificationId
                                                                    }
                                                                    className={`notification-item ${
                                                                        notif.isRead
                                                                            ? "read"
                                                                            : "unread"
                                                                    }`}
                                                                    onClick={() => {
                                                                        markAsRead(
                                                                            notif.notificationId
                                                                        );
                                                                        handleToDetailNews(
                                                                            notif.ojectId
                                                                        );
                                                                    }}
                                                                >
                                                                    <NewsIcon className="notification-icon" />
                                                                    <div>
                                                                        <strong>
                                                                            {
                                                                                notif.content
                                                                            }
                                                                        </strong>
                                                                        <p>
                                                                            Đi
                                                                            đến
                                                                            bài
                                                                            đăng
                                                                        </p>
                                                                        <p>
                                                                            {notif?.createdDate
                                                                                ? dayjs
                                                                                      .utc(
                                                                                          notif.createdDate
                                                                                      )
                                                                                      .tz(
                                                                                          "Asia/Ho_Chi_Minh"
                                                                                      )
                                                                                      .fromNow()
                                                                                : ""}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;

                                                    case "Personal Donor Certificate":
                                                    case "Organization Donor Certificate":
                                                    case "Recipient Certificate":
                                                        if (
                                                            notificationTab ===
                                                            "chungnhan"
                                                        ) {
                                                            let type = "";
                                                            if (
                                                                notif.objectType ===
                                                                "Personal Donor Certificate"
                                                            )
                                                                type =
                                                                    "Personal";
                                                            if (
                                                                notif.objectType ===
                                                                "Organization Donor Certificate"
                                                            )
                                                                type =
                                                                    "Organization";
                                                            if (
                                                                notif.objectType ===
                                                                "Recipient Certificate"
                                                            )
                                                                type =
                                                                    "Recipient";

                                                            let actionText = "";
                                                            if (
                                                                notif.notificationType ===
                                                                "Approve"
                                                            )
                                                                actionText =
                                                                    "Đơn xác minh đã được phê duyệt.";
                                                            if (
                                                                notif.notificationType ===
                                                                "Reject"
                                                            )
                                                                actionText =
                                                                    "Đơn xác minh đã bị từ chối.";
                                                            if (
                                                                notif.notificationType ===
                                                                "Review"
                                                            )
                                                                actionText =
                                                                    "Đơn xác minh đang chờ xem xét.";
                                                            if (
                                                                notif.notificationType ===
                                                                "Pending"
                                                            )
                                                                actionText =
                                                                    "Đơn xác minh cần bổ sung thêm thông tin.";

                                                            if (actionText) {
                                                                return (
                                                                    <div
                                                                        key={
                                                                            notif.notificationId
                                                                        }
                                                                        className={`notification-item ${
                                                                            notif.isRead
                                                                                ? "read"
                                                                                : "unread"
                                                                        }`}
                                                                        onClick={() => {
                                                                            markAsRead(
                                                                                notif.notificationId
                                                                            );
                                                                            handleToDetailCertificate(
                                                                                notif.ojectId,
                                                                                type
                                                                            );
                                                                        }}
                                                                    >
                                                                        <CertificateIcon className="notification-icon" />
                                                                        <div>
                                                                            <strong>
                                                                                {
                                                                                    notif.content
                                                                                }
                                                                            </strong>
                                                                            <p>
                                                                                {
                                                                                    actionText
                                                                                }
                                                                            </p>
                                                                            <p>
                                                                                {notif?.createdDate
                                                                                    ? dayjs
                                                                                          .utc(
                                                                                              notif.createdDate
                                                                                          )
                                                                                          .tz(
                                                                                              "Asia/Ho_Chi_Minh"
                                                                                          )
                                                                                          .fromNow()
                                                                                    : ""}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                                                        }
                                                        return null;

                                                    default:
                                                        return null;
                                                }

                                                return null;
                                            })
                                        ) : (
                                            <div className="notification-empty">
                                                Không có thông báo
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <p className="name">
                                Hello {userLogin?.fullName || "Người dùng"}
                            </p>
                            <MenuIcon
                                width={30}
                                height={30}
                                className="menu-icon"
                                onClick={() =>
                                    setIsSubMenuProfileOpen(
                                        !isSubMenuProfileOpen
                                    )
                                }
                            />
                            {isSubMenuProfileOpen && (
                                <div className="sub-menu-profile">
                                    <ul>
                                        <li>
                                            <Link
                                                to={routes.user.personal}
                                                onClick={() =>
                                                    setIsSubMenuProfileOpen(
                                                        false
                                                    )
                                                }
                                            >
                                                Xem trang cá nhân
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                to={routes.user.profile}
                                                onClick={() =>
                                                    setIsSubMenuProfileOpen(
                                                        false
                                                    )
                                                }
                                            >
                                                Chỉnh sửa thông tin
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                to={routes.user.change_pass}
                                                onClick={() =>
                                                    setIsSubMenuProfileOpen(
                                                        false
                                                    )
                                                }
                                            >
                                                Đổi mật khẩu
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={""} onClick={logout}>
                                                Đăng xuất
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <SubmitCertificateModal
                isOpen={isSubmitCertificateModalOpen}
                setIsOpen={setIsSubmitCertificateModalOpen}
            />
            <CreateCampaignModal
                isOpen={isCreateCampaignModalOpen}
                setIsOpen={setIsCreateCampaignModalOpen}
            />
            <CreateRequestSupportModal
                isOpen={isRequestSupportModalOpen}
                setIsOpen={setIsRequestSupportModalOpen}
            />
            <DonorGuideModal
                isOpen={isDonorGuildModalOpen}
                setIsOpen={setIsDonorGuildModalOpen}
            />
            <RecipientGuideModal
                isOpen={isRecipientGuildModalOpen}
                setIsOpen={setIsRecipientGuildModalOpen}
            />
        </header>
    );
};

export default HeaderLanding;
