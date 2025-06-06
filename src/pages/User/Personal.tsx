import {
    selectGetAllCampaign,
    selectGetAllCampaignRequestSupport,
    selectGetAllDonate,
    selectGetAllDonorCertificate,
    selectGetAllRecipientCertificate,
    selectGetAllRegisterReceivers,
    selectGetAllRequestSupport,
    selectGetProfileUser,
    selectIsAuthenticated,
    selectUserLogin,
} from "@/app/selector";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { ArrowLeft, ArrowRight } from "@/assets/icons";
import { AvatarUser, NoResult } from "@/assets/images";
import { Loading } from "@/components/Elements";
import {
    CancelCampaignModal,
    CreateCampaignModal,
    RecipientCertificateModal,
    SubmitCertificateModal,
} from "@/components/Modal";
import { navigateHook } from "@/routes/RouteApp";
import { routes } from "@/routes/routeName";
import { setLoading } from "@/services/app/appSlice";
import { getAllCampaignApiThunk } from "@/services/campaign/campaignThunk";
import { getAllRegisterReceiversApiThunk } from "@/services/registerReceive/registerReceiveThunk";
import {
    getAllDonorCertificateApiThunk,
    getAllRecipientCertificateApiThunk,
    getProfileApiThunk,
} from "@/services/user/userThunk";
import { CancelCampaign } from "@/types/campaign";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { formatDater, formatTime } from "@/utils/helper";
import { getAllRequestSupportApiThunk } from "@/services/requestSupport/requestSupportThunk";
import classNames from "classnames";
import { toast } from "react-toastify";
import { getAllDonateApiThunk } from "@/services/donate/donateThunk";
import { getAllCampaignRequestSupportApiThunk } from "@/services/campaignRequestSupport/campaignRequestSupportThunk";

dayjs.locale("vi");
dayjs.extend(relativeTime);

const UserPersonalPage = () => {
    const dispatch = useAppDispatch();

    const [searchTermDonor, setSearchTermDonor] = useState("");

    // Lấy dữ liệu từ Redux store
    const profileUser = useAppSelector(selectGetProfileUser);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const userLogin = useAppSelector(selectUserLogin);

    const campaigns = useAppSelector(selectGetAllCampaign);
    const sortedCampaigns = [...campaigns].reverse();

    const donorCertificates = useAppSelector(selectGetAllDonorCertificate);
    const sortedDonorCertificates = [...donorCertificates].reverse();

    const recipientCertificates = useAppSelector(
        selectGetAllRecipientCertificate
    );
    const sortedRecipientCertificates = [...recipientCertificates].reverse();

    const registerReceivers = useAppSelector(selectGetAllRegisterReceivers);
    const sortedRegisterReceivers = [...registerReceivers].reverse();

    const requestSupport = useAppSelector(selectGetAllRequestSupport);
    const sortedRequestSupport = [...requestSupport].reverse();

    const donates = useAppSelector(selectGetAllDonate);
    const sortedDonates = [...donates].reverse();

    const campaignsRequestSupport = useAppSelector(
        selectGetAllCampaignRequestSupport
    );
    const sortedCampaignsRequestSupport = [...campaignsRequestSupport].reverse();

    // Lọc dữ liệu theo tài khoản đăng nhập
    const currentCampaigns = sortedCampaigns.filter(
        (campaign) => campaign.accountId === userLogin?.accountId
    );

    const currentDonorCertificates = sortedDonorCertificates.filter(
        (donorCertificate) => donorCertificate.donorId === userLogin?.accountId
    );

    const currentRecipientCertificates = sortedRecipientCertificates.filter(
        (recipientCertificate) =>
            recipientCertificate.recipientId === userLogin?.accountId
    );

    const currentRegisterReceivers = sortedRegisterReceivers.filter(
        (registerReceiver) =>
            registerReceiver.accountId === userLogin?.accountId
    );

    const currentRequestDonor = sortedRequestSupport.filter(
        (requestSupport) => requestSupport.accountId === userLogin?.accountId
    );

    const currentDonates = sortedDonates.filter(
        (donate) => donate.donorId === userLogin?.accountId
    );

    const currentCampaignsRequestSupport = sortedCampaignsRequestSupport.filter(
        (campaignRequestSupport) =>
            campaignRequestSupport.accountId === userLogin?.accountId
    );

    // State quản lý modal
    const [isSubmitCertificateModalOpen, setIsSubmitCertificateModalOpen] =
        useState(false);
    const [
        isRecipientCertificateModalOpen,
        setIsRecipientCertificateModalOpen,
    ] = useState(false);
    const [isCreateCampaignModalOpen, setIsCreateCampaignModalOpen] =
        useState(false);
    const [isCancelCampaignModalOpen, setIsCancelCampaignModalOpen] =
        useState(false);

    const [isFiltering, setIsFiltering] = useState(false);
    const [selectedCancelCampaign, setSelectedCancelCampaign] =
        useState<CancelCampaign | null>(null);

    // Hooks điều hướng
    const location = useLocation();
    const navigate = useNavigate();

    const getActiveTabFromURL = () => {
        const params = new URLSearchParams(location.search);
        const tab = params.get("tab");

        if (!tab) {
            navigate(`?tab=chiendich`, { replace: true });
            return "chiendich";
        }

        return tab;
    };

    const [activeTab, setActiveTab] = useState<string>(getActiveTabFromURL());

    const handleTabChange = (tabIndex: string) => {
        setActiveTab(tabIndex);
        navigate(`?tab=${tabIndex}`);
    };

    const handleFilter = () => {
        setIsFiltering(true);
        setTimeout(() => {
            setIsFiltering(false);
        }, 1000);
    };

    useEffect(() => {
        setActiveTab(getActiveTabFromURL());
    }, [location.search]);

    useEffect(() => {
        document.title = "Trang cá nhân";
        dispatch(setLoading(true));
        Promise.all([
            dispatch(getAllRegisterReceiversApiThunk()).unwrap(),
            dispatch(getAllDonorCertificateApiThunk()).unwrap(),
            dispatch(getAllRecipientCertificateApiThunk()).unwrap(),
            dispatch(getAllCampaignApiThunk()).unwrap(),
            dispatch(getAllRequestSupportApiThunk()).unwrap(),
            dispatch(getAllDonateApiThunk()).unwrap(),
            dispatch(getAllCampaignRequestSupportApiThunk()).unwrap(),
        ])
            .catch(() => {})
            .finally(() => {
                setTimeout(() => {
                    dispatch(setLoading(false));
                }, 1000);
            });
    }, [dispatch]);

    const handleCreateCampaign = () => {
        if (profileUser?.isConfirm === false) {
            setIsSubmitCertificateModalOpen(true);
        }
        if (profileUser?.isConfirm === true) {
            setIsCreateCampaignModalOpen(true);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(getProfileApiThunk(String(userLogin?.accountId))).unwrap();
        }
    }, [isAuthenticated]);

    const handleToDetailCampaign = (campaignId: string) => {
        const url = routes.user.detail_campaign.replace(":id", campaignId);
        return navigateHook(url);
    };

    const handleToDetailCampaignRequestSupport = (campaignRequestSupportId: string) => {
        const url = routes.user.detail_campaign_request_support.replace(":id", campaignRequestSupportId);
        return navigateHook(url);
    };

    const handleToDetailCampaignRecipient = (campaignId: string) => {
        const url = routes.user.campaign.detail.replace(":id", campaignId);
        return navigateHook(url);
    };

    const handleToDetailCertificate = (certificateId: string, type: string) => {
        const url = routes.user.detail_certificate.replace(
            ":id",
            certificateId
        );
        if (type === "Personal") {
            return navigateHook(`${url}?type=Personal`);
        }
        if (type === "Organization") {
            return navigateHook(`${url}?type=Organization`);
        }
        if (type === "Recipient") {
            return navigateHook(`${url}?type=Recipient`);
        }
    };

    const handelCancelCampain = (campaignId: string) => {
        setIsCancelCampaignModalOpen(true);
        setSelectedCancelCampaign({ campaignId, comment: "" });
    };

    const handleToDetailRequestSupport = (requestSupportId: string) => {
        const url = routes.user.detail_request_support.replace(
            ":id",
            requestSupportId
        );
        return navigateHook(url);
    };

    //Phân trang
    const ITEMS_PER_PAGE = 5;

    //Campaign
    const [currentCampaignPage, setCurrentCampaignPage] = useState(1);

    const filteredCampaigns = currentCampaigns.filter((campaign) =>
        campaign.campaignName
            .toLowerCase()
            .includes(searchTermDonor.toLowerCase())
    );

    const totalCampaignPages = Math.ceil(
        filteredCampaigns.length / ITEMS_PER_PAGE
    );

    const currentCampaignsPage = filteredCampaigns.slice(
        (currentCampaignPage - 1) * ITEMS_PER_PAGE,
        currentCampaignPage * ITEMS_PER_PAGE
    );

    const onPreviousCampaignPage = () => {
        if (currentCampaignPage > 1)
            setCurrentCampaignPage(currentCampaignPage - 1);
    };

    const onNextCampaignPage = () => {
        if (currentCampaignPage < totalCampaignPages)
            setCurrentCampaignPage(currentCampaignPage + 1);
    };

    //Donor certificate
    const [currentDonorCertificatePage, setCurrentDonorCertificatePage] =
        useState(1);

    const totalDonorCertificatePages = Math.ceil(
        currentDonorCertificates.length / ITEMS_PER_PAGE
    );

    const currentDonorCertificatesPage = currentDonorCertificates.slice(
        (currentDonorCertificatePage - 1) * ITEMS_PER_PAGE,
        currentDonorCertificatePage * ITEMS_PER_PAGE
    );

    const onPreviousDonorCertificatePage = () => {
        if (currentDonorCertificatePage > 1)
            setCurrentDonorCertificatePage(currentDonorCertificatePage - 1);
    };

    const onNextDonorCertificatePage = () => {
        if (currentDonorCertificatePage < totalDonorCertificatePages)
            setCurrentDonorCertificatePage(currentDonorCertificatePage + 1);
    };

    //Campaign request support
    const [currentCampaignRequestSupportPage, setCurrentCampaignRequestSupportPage] =
        useState(1);

    const totalCampaignRequestSupportPages = Math.ceil(
        currentCampaignsRequestSupport.length / ITEMS_PER_PAGE
    );

    const currentCampaignRequestSupportsPage = currentCampaignsRequestSupport.slice(
        (currentCampaignRequestSupportPage - 1) * ITEMS_PER_PAGE,
        currentCampaignRequestSupportPage * ITEMS_PER_PAGE
    );

    const onPreviousCampaignRequestSupportPage = () => {
        if (currentCampaignRequestSupportPage > 1)
            setCurrentCampaignRequestSupportPage(
                currentCampaignRequestSupportPage - 1
            );
    };

    const onNextCampaignRequestSupportPage = () => {
        if (currentCampaignRequestSupportPage < totalCampaignRequestSupportPages)
            setCurrentCampaignRequestSupportPage(
                currentCampaignRequestSupportPage + 1
            );
    };

    //Register Receiver
    const [currentRegisterReceiverPage, setCurrentRegisterReceiverPage] =
        useState(1);

    const totalRegisterReceiverPages = Math.ceil(
        currentRegisterReceivers.length / ITEMS_PER_PAGE
    );

    const currentRegisterReceiversPage = currentRegisterReceivers.slice(
        (currentRegisterReceiverPage - 1) * ITEMS_PER_PAGE,
        currentRegisterReceiverPage * ITEMS_PER_PAGE
    );

    const onPreviousRegisterReceiverPage = () => {
        if (currentRegisterReceiverPage > 1)
            setCurrentRegisterReceiverPage(currentRegisterReceiverPage - 1);
    };

    const onNextRegisterReceiverPage = () => {
        if (currentRegisterReceiverPage < totalRegisterReceiverPages)
            setCurrentRegisterReceiverPage(currentRegisterReceiverPage + 1);
    };

    //Donor donate
    const [currentDonorDonatePage, setCurrentDonorDonatePage] = useState(1);

    const totalDonorDonatePages = Math.ceil(
        currentDonates.length / ITEMS_PER_PAGE
    );

    const currentDonorDonatesPage = currentDonates.slice(
        (currentDonorDonatePage - 1) * ITEMS_PER_PAGE,
        currentDonorDonatePage * ITEMS_PER_PAGE
    );

    const onPreviousDonorDonatePage = () => {
        if (currentDonorDonatePage > 1)
            setCurrentDonorDonatePage(currentDonorDonatePage - 1);
    };

    const onNextDonorDonatePage = () => {
        if (currentDonorDonatePage < totalDonorDonatePages)
            setCurrentDonorDonatePage(currentDonorDonatePage + 1);
    };

    //Recipient certificate
    const [
        currentRecipientCertificatePage,
        setCurrentRecipientCertificatePage,
    ] = useState(1);

    const totalRecipientCertificatePages = Math.ceil(
        currentRecipientCertificates.length / ITEMS_PER_PAGE
    );

    const currentRecipientCertificatesPage = currentRecipientCertificates.slice(
        (currentRecipientCertificatePage - 1) * ITEMS_PER_PAGE,
        currentRecipientCertificatePage * ITEMS_PER_PAGE
    );

    const onPreviousRecipientCertificatePage = () => {
        if (currentRecipientCertificatePage > 1)
            setCurrentRecipientCertificatePage(
                currentRecipientCertificatePage - 1
            );
    };

    const onNextRecipientCertificatePage = () => {
        if (currentRecipientCertificatePage < totalRecipientCertificatePages)
            setCurrentRecipientCertificatePage(
                currentRecipientCertificatePage + 1
            );
    };

    //Request support
    const [currentRequestSupportPage, setCurrentRequestSupportPage] =
        useState(1);

    const totalNewsPages = Math.ceil(
        currentRequestDonor.length / ITEMS_PER_PAGE
    );

    const currentRequestSupportsPage = currentRequestDonor.slice(
        (currentRequestSupportPage - 1) * ITEMS_PER_PAGE,
        currentRequestSupportPage * ITEMS_PER_PAGE
    );

    const onPreviousRequestSupportPage = () => {
        if (currentRequestSupportPage > 1)
            setCurrentRequestSupportPage(currentRequestSupportPage - 1);
    };

    const onNextRequestSupportPage = () => {
        if (currentRequestSupportPage < totalNewsPages)
            setCurrentRequestSupportPage(currentRequestSupportPage + 1);
    };

    const isWithin24Hours = (createdDate: string) => {
        const campaignCreatedTime = new Date(createdDate);

        // Cộng thêm 7 giờ để đổi từ UTC sang giờ Việt Nam (UTC+7)
        campaignCreatedTime.setHours(campaignCreatedTime.getHours() + 7);

        const currentTime = new Date();
        const timeDifference =
            currentTime.getTime() - campaignCreatedTime.getTime();
        const hoursDifference = timeDifference / (1000 * 3600);
        return hoursDifference <= 24;
    };

    const handleCancelClick = (campaignId: string, createdDate: string) => {
        if (isWithin24Hours(createdDate)) {
            handelCancelCampain(campaignId);
        } else {
            alert(
                "Đã quá 24h kể từ khi bạn tạo chiến dịch, bạn không thể huỷ chiến dịch này."
            );
        }
    };

    const handleConfirmRecipient = () => {
        if (profileUser?.isConfirm === false) {
            setIsRecipientCertificateModalOpen(true);
        }
        if (profileUser?.isConfirm === true) {
            setIsRecipientCertificateModalOpen(false);
            toast.info("Tài khoản đã được xác minh.");
        }
    };

    const handleConfirmDonor = () => {
        if (profileUser?.isConfirm === false) {
            navigateHook(routes.user.submit_certificate);
        }
        if (profileUser?.isConfirm === true) {
            toast.info("Tài khoản đã được xác minh.");
        }
    };

    return (
        <main id="user-personal-page">
            <section id="upp-s1"></section>
            <section id="upp-s2">
                <div className="upps2-container">
                    <div className="upps2cr1">
                        <div className="upps2cr1c1">
                            <div className="upps2cr1c1c1">
                                <img
                                    src={AvatarUser}
                                    alt=""
                                    className="upp-avatar"
                                />
                            </div>
                            <div className="upps2cr1c1c2">
                                <h2>{userLogin?.fullName}</h2>
                                <p>{userLogin?.email}</p>
                            </div>
                        </div>
                        <div className="upps2cr1c2">
                            <button
                                className="pr-btn"
                                onClick={() =>
                                    navigateHook(routes.user.profile)
                                }
                            >
                                Chỉnh sửa thông tin
                            </button>
                        </div>
                    </div>
                    {isFiltering && <Loading loading={true} isFullPage />}
                    {userLogin?.roleId === 3 && (
                        <>
                            <div className="upps2cr2">
                                <div className="upp-tabs">
                                    <div
                                        className={`upp-tabs-item ${
                                            activeTab === "chiendich"
                                                ? "upp-tabs-item-actived"
                                                : ""
                                        }`}
                                        onClick={() => {
                                            handleTabChange("chiendich"),
                                                handleFilter();
                                        }}
                                    >
                                        Chiến dịch
                                    </div>
                                    <div
                                        className={`upp-tabs-item ${
                                            activeTab === "chungchi"
                                                ? "upp-tabs-item-actived"
                                                : ""
                                        }`}
                                        onClick={() => {
                                            handleTabChange("chungchi"),
                                                handleFilter();
                                        }}
                                    >
                                        Xác nhận danh tính
                                    </div>
                                    <div
                                        className={`upp-tabs-item ${
                                            activeTab === "ungho"
                                                ? "upp-tabs-item-actived"
                                                : ""
                                        }`}
                                        onClick={() => {
                                            handleTabChange("ungho"),
                                                handleFilter();
                                        }}
                                    >
                                        Ủng hộ
                                    </div>
                                    <div
                                        className={`upp-tabs-item ${
                                            activeTab === "chiendichhotro"
                                                ? "upp-tabs-item-actived"
                                                : ""
                                        }`}
                                        onClick={() => {
                                            handleTabChange("chiendichhotro"),
                                                handleFilter();
                                        }}
                                    >
                                        Chiến dịch hỗ trợ
                                    </div>
                                </div>
                            </div>
                            <div className="upps2cr3">
                                {activeTab === "chiendich" && (
                                    <div className="upp-content">
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginBottom: "20px",
                                            }}
                                        >
                                            <button
                                                className="pr-btn"
                                                onClick={handleCreateCampaign}
                                            >
                                                Tạo chiến dịch
                                            </button>
                                            <div className="search-container">
                                                <p
                                                    style={{
                                                        textAlign: "right",
                                                        fontWeight: "bold",
                                                        fontSize: "16px",
                                                    }}
                                                >
                                                    Tìm kiếm
                                                </p>
                                                <input
                                                    className="pr-input search-input"
                                                    placeholder="Tìm kiếm theo tên chiến dịch"
                                                    value={searchTermDonor}
                                                    style={{
                                                        width: "400px",
                                                    }}
                                                    onChange={(e) => {
                                                        setSearchTermDonor(
                                                            e.target.value
                                                        );
                                                        setCurrentCampaignPage(
                                                            1
                                                        );
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        {currentCampaigns.length === 0 ? (
                                            <>
                                                <figure>
                                                    <img
                                                        src={NoResult}
                                                        alt=""
                                                    />
                                                </figure>
                                                <h1>Chưa có dữ liệu</h1>
                                            </>
                                        ) : (
                                            <>
                                                <table className="table">
                                                    <thead className="table-head">
                                                        <tr className="table-head-row">
                                                            <th className="table-head-cell">
                                                                Tên chiến dịch
                                                            </th>
                                                            <th className="table-head-cell">
                                                                Trạng thái
                                                            </th>
                                                            <th className="table-head-cell">
                                                                Thời gian tạo
                                                            </th>
                                                            <th className="table-head-cell">
                                                                Hành động
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="table-body">
                                                        {currentCampaignsPage.map(
                                                            (
                                                                campaign,
                                                                index
                                                            ) => (
                                                                <tr
                                                                    className="table-body-row"
                                                                    key={index}
                                                                >
                                                                    <td className="table-body-cell">
                                                                        {
                                                                            campaign.campaignName
                                                                        }
                                                                    </td>
                                                                    <td className="table-body-cell">
                                                                        {campaign.status ===
                                                                        "Pending" ? (
                                                                            <span className="status-pending">
                                                                                Đang
                                                                                chờ
                                                                                phê
                                                                                duyệt
                                                                            </span>
                                                                        ) : campaign.status ===
                                                                          "Approved" ? (
                                                                            <span className="status-approve">
                                                                                Đã
                                                                                được
                                                                                phê
                                                                                duyệt
                                                                            </span>
                                                                        ) : campaign.status ===
                                                                          "Rejected" ? (
                                                                            <span className="status-reject">
                                                                                Đã
                                                                                bị
                                                                                từ
                                                                                chối
                                                                            </span>
                                                                        ) : campaign.status ===
                                                                          "Canceled" ? (
                                                                            <span className="status-reject">
                                                                                Đã
                                                                                huỷ
                                                                            </span>
                                                                        ) : null}
                                                                    </td>
                                                                    <td className="table-body-cell">
                                                                        {campaign?.createdDate
                                                                            ? dayjs(
                                                                                  campaign.createdDate
                                                                              ).fromNow()
                                                                            : ""}
                                                                    </td>
                                                                    <td className="table-body-cell">
                                                                        <button
                                                                            className="view-btn"
                                                                            onClick={() =>
                                                                                handleToDetailCampaign(
                                                                                    campaign.campaignId
                                                                                )
                                                                            }
                                                                        >
                                                                            Xem
                                                                            chi
                                                                            tiết
                                                                        </button>
                                                                        {(campaign.status ===
                                                                            "Pending" ||
                                                                            campaign.status ===
                                                                                "Approved") && (
                                                                            <button
                                                                                className="reject-btn"
                                                                                onClick={() =>
                                                                                    handleCancelClick(
                                                                                        campaign.campaignId,
                                                                                        campaign.createdDate
                                                                                    )
                                                                                }
                                                                            >
                                                                                Hủy
                                                                                chiến
                                                                                dịch
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                                <div className="paginator">
                                                    <div className="p-container">
                                                        <div className="pcc2">
                                                            {
                                                                currentCampaignPage
                                                            }{" "}
                                                            of{" "}
                                                            {totalCampaignPages}
                                                        </div>
                                                        <div className="pcc3">
                                                            <button
                                                                disabled={
                                                                    currentCampaignPage ===
                                                                    1
                                                                }
                                                                onClick={
                                                                    onPreviousCampaignPage
                                                                }
                                                            >
                                                                <ArrowLeft className="pcc3-icon" />
                                                            </button>
                                                            <button
                                                                disabled={
                                                                    currentCampaignPage >=
                                                                    totalCampaignPages
                                                                }
                                                                onClick={
                                                                    onNextCampaignPage
                                                                }
                                                            >
                                                                <ArrowRight
                                                                    className={`pcc3-icon ${
                                                                        currentCampaignPage >=
                                                                        totalCampaignPages
                                                                            ? "pcc3-icon-disabled"
                                                                            : ""
                                                                    }`}
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                                {activeTab === "chungchi" && (
                                    <div className="upp-content">
                                        <button
                                            className={classNames("pr-btn", {
                                                "disabled-btn":
                                                    profileUser?.isConfirm ===
                                                    true,
                                            })}
                                            onClick={handleConfirmDonor}
                                        >
                                            {profileUser?.isConfirm === true
                                                ? "Đã được xác minh"
                                                : "Xác minh tài khoản"}
                                        </button>
                                        {currentDonorCertificates.length ===
                                        0 ? (
                                            <>
                                                <figure>
                                                    <img
                                                        src={NoResult}
                                                        alt=""
                                                    />
                                                </figure>
                                                <h1>Chưa có dữ liệu</h1>
                                            </>
                                        ) : (
                                            <>
                                                <table className="table">
                                                    <thead className="table-head">
                                                        <tr className="table-head-row">
                                                            <th className="table-head-cell">
                                                                Đối tượng xác
                                                                thực
                                                            </th>
                                                            <th className="table-head-cell">
                                                                Trạng thái
                                                            </th>
                                                            <th className="table-head-cell">
                                                                Thời gian tạo
                                                            </th>
                                                            <th className="table-head-cell">
                                                                Hành động
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="table-body">
                                                        {currentDonorCertificatesPage.map(
                                                            (row, index) => (
                                                                <tr
                                                                    key={index}
                                                                    className="table-body-row"
                                                                >
                                                                    <td className="table-body-cell">
                                                                        {row.organizationName ===
                                                                        null
                                                                            ? "Cá nhân"
                                                                            : "Tổ chức"}
                                                                    </td>
                                                                    <td className="table-body-cell">
                                                                        {row.status ===
                                                                        "Pending" ? (
                                                                            <span className="status-pending">
                                                                                Đang
                                                                                chờ
                                                                                phê
                                                                                duyệt
                                                                            </span>
                                                                        ) : row.status ===
                                                                          "Approved" ? (
                                                                            <span className="status-approve">
                                                                                Đã
                                                                                được
                                                                                phê
                                                                                duyệt
                                                                            </span>
                                                                        ) : (
                                                                            <span className="status-reject">
                                                                                Đã
                                                                                bị
                                                                                từ
                                                                                chối
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="table-body-cell">
                                                                        {row?.createdDate
                                                                            ? dayjs(
                                                                                  row.createdDate
                                                                              ).fromNow()
                                                                            : ""}
                                                                    </td>
                                                                    <td className="table-body-cell">
                                                                        <button
                                                                            className="view-btn"
                                                                            onClick={() =>
                                                                                row.organizationName ===
                                                                                null
                                                                                    ? handleToDetailCertificate(
                                                                                          row.donorCertificateId,
                                                                                          "Personal"
                                                                                      )
                                                                                    : handleToDetailCertificate(
                                                                                          row.donorCertificateId,
                                                                                          "Organization"
                                                                                      )
                                                                            }
                                                                        >
                                                                            Xem
                                                                            chi
                                                                            tiết
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                                <div className="paginator">
                                                    <div className="p-container">
                                                        <div className="pcc2">
                                                            {
                                                                currentDonorCertificatePage
                                                            }{" "}
                                                            of{" "}
                                                            {
                                                                totalDonorCertificatePages
                                                            }
                                                        </div>
                                                        <div className="pcc3">
                                                            <button
                                                                disabled={
                                                                    currentDonorCertificatePage ===
                                                                    1
                                                                }
                                                                onClick={
                                                                    onPreviousDonorCertificatePage
                                                                }
                                                            >
                                                                <ArrowLeft className="pcc3-icon" />
                                                            </button>
                                                            <button
                                                                disabled={
                                                                    currentDonorCertificatePage >=
                                                                    totalDonorCertificatePages
                                                                }
                                                                onClick={
                                                                    onNextDonorCertificatePage
                                                                }
                                                            >
                                                                <ArrowRight
                                                                    className={`pcc3-icon ${
                                                                        currentDonorCertificatePage >=
                                                                        totalDonorCertificatePages
                                                                            ? "pcc3-icon-disabled"
                                                                            : ""
                                                                    }`}
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                                {activeTab === "ungho" && (
                                    <div className="upp-content">
                                        <button
                                            className="pr-btn"
                                            onClick={() =>
                                                navigateHook(routes.user.donate)
                                            }
                                        >
                                            Ủng hộ hệ thống
                                        </button>
                                        {currentDonates.length === 0 ? (
                                            <>
                                                <figure>
                                                    <img
                                                        src={NoResult}
                                                        alt=""
                                                    />
                                                </figure>
                                                <h1>Chưa có dữ liệu</h1>
                                            </>
                                        ) : (
                                            <>
                                                <table className="table">
                                                    <thead className="table-head">
                                                        <tr className="table-head-row">
                                                            <th className="table-head-cell">
                                                                Số tiền ủng hộ
                                                            </th>
                                                            <th className="table-head-cell">
                                                                Trạng thái
                                                            </th>
                                                            <th className="table-head-cell">
                                                                Thời gian ủng hộ
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="table-body">
                                                        {currentDonorDonatesPage.map(
                                                            (row, index) => (
                                                                <tr
                                                                    key={index}
                                                                    className="table-body-row"
                                                                >
                                                                    <td className="table-body-cell">
                                                                        {
                                                                            row.amount
                                                                        }
                                                                    </td>
                                                                    <td className="table-body-cell">
                                                                        {row.isPaid ===
                                                                        true ? (
                                                                            <span className="status-approve">
                                                                                Thanh
                                                                                toán
                                                                                thành
                                                                                công
                                                                            </span>
                                                                        ) : (
                                                                            <span className="status-reject">
                                                                                Thanh
                                                                                toán
                                                                                thất
                                                                                bại
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="table-body-cell">
                                                                        {formatDater(
                                                                            row.createdAt
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                                <div className="paginator">
                                                    <div className="p-container">
                                                        <div className="pcc2">
                                                            {
                                                                currentDonorDonatePage
                                                            }{" "}
                                                            of{" "}
                                                            {
                                                                totalDonorCertificatePages
                                                            }
                                                        </div>
                                                        <div className="pcc3">
                                                            <button
                                                                disabled={
                                                                    currentDonorDonatePage ===
                                                                    1
                                                                }
                                                                onClick={
                                                                    onPreviousDonorDonatePage
                                                                }
                                                            >
                                                                <ArrowLeft className="pcc3-icon" />
                                                            </button>
                                                            <button
                                                                disabled={
                                                                    currentDonorDonatePage >=
                                                                    totalDonorCertificatePages
                                                                }
                                                                onClick={
                                                                    onNextDonorDonatePage
                                                                }
                                                            >
                                                                <ArrowRight
                                                                    className={`pcc3-icon ${
                                                                        currentDonorDonatePage >=
                                                                        totalDonorCertificatePages
                                                                            ? "pcc3-icon-disabled"
                                                                            : ""
                                                                    }`}
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                                {activeTab === "chiendichhotro" && (
                                    <div className="upp-content">
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginBottom: "20px",
                                            }}
                                        >
                                            <div className="search-container">
                                                <p
                                                    style={{
                                                        textAlign: "left",
                                                        fontWeight: "bold",
                                                        fontSize: "16px",
                                                    }}
                                                >
                                                    Tìm kiếm
                                                </p>
                                                <input
                                                    className="pr-input search-input"
                                                    placeholder="Tìm kiếm theo tên chiến dịch"
                                                    value={searchTermDonor}
                                                    style={{
                                                        width: "400px",
                                                    }}
                                                    onChange={(e) => {
                                                        setSearchTermDonor(
                                                            e.target.value
                                                        );
                                                        setCurrentCampaignPage(
                                                            1
                                                        );
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        {currentCampaignsRequestSupport.length === 0 ? (
                                            <>
                                                <figure>
                                                    <img
                                                        src={NoResult}
                                                        alt=""
                                                    />
                                                </figure>
                                                <h1>Chưa có dữ liệu</h1>
                                            </>
                                        ) : (
                                            <>
                                                <table className="table">
                                                    <thead className="table-head">
                                                        <tr className="table-head-row">
                                                            <th className="table-head-cell">
                                                                Tên chiến dịch
                                                            </th>
                                                            <th className="table-head-cell">
                                                                Trạng thái
                                                            </th>
                                                            <th className="table-head-cell">
                                                                Thời gian tạo
                                                            </th>
                                                            <th className="table-head-cell">
                                                                Hành động
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="table-body">
                                                        {currentCampaignRequestSupportsPage.map(
                                                            (
                                                                campaign,
                                                                index
                                                            ) => (
                                                                <tr
                                                                    className="table-body-row"
                                                                    key={index}
                                                                >
                                                                    <td className="table-body-cell">
                                                                        {
                                                                            campaign.campaignRequestSupportName
                                                                        }
                                                                    </td>
                                                                    <td className="table-body-cell">
                                                                        {campaign.status ===
                                                                        "Pending" ? (
                                                                            <span className="status-pending">
                                                                                Đang
                                                                                chờ
                                                                                phê
                                                                                duyệt
                                                                            </span>
                                                                        ) : campaign.status ===
                                                                          "Approved" ? (
                                                                            <span className="status-approve">
                                                                                Đã
                                                                                được
                                                                                phê
                                                                                duyệt
                                                                            </span>
                                                                        ) : campaign.status ===
                                                                          "Rejected" ? (
                                                                            <span className="status-reject">
                                                                                Đã
                                                                                bị
                                                                                từ
                                                                                chối
                                                                            </span>
                                                                        ) : campaign.status ===
                                                                          "Canceled" ? (
                                                                            <span className="status-reject">
                                                                                Đã
                                                                                huỷ
                                                                            </span>
                                                                        ) : null}
                                                                    </td>
                                                                    <td className="table-body-cell">
                                                                        {campaign?.createdDate
                                                                            ? dayjs(
                                                                                  campaign.createdDate
                                                                              ).fromNow()
                                                                            : ""}
                                                                    </td>
                                                                    <td className="table-body-cell">
                                                                        <button
                                                                            className="view-btn"
                                                                            onClick={() =>
                                                                                handleToDetailCampaignRequestSupport(
                                                                                    String(campaign.campaignRequestSupportId)
                                                                                )
                                                                            }
                                                                        >
                                                                            Xem
                                                                            chi
                                                                            tiết
                                                                        </button>
                                                                        {(campaign.status ===
                                                                            "Pending" ||
                                                                            campaign.status ===
                                                                                "Approved") && (
                                                                            <button
                                                                                className="reject-btn"
                                                                                // onClick={() =>
                                                                                //     handleCancelClick(
                                                                                //         campaign.campaignRequestSupportId,
                                                                                //         campaign.createdDate
                                                                                //     )
                                                                                // }
                                                                            >
                                                                                Hủy
                                                                                chiến
                                                                                dịch
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                                <div className="paginator">
                                                    <div className="p-container">
                                                        <div className="pcc2">
                                                            {
                                                                currentCampaignRequestSupportPage
                                                            }{" "}
                                                            of{" "}
                                                            {totalCampaignRequestSupportPages}
                                                        </div>
                                                        <div className="pcc3">
                                                            <button
                                                                disabled={
                                                                    currentCampaignRequestSupportPage ===
                                                                    1
                                                                }
                                                                onClick={
                                                                    onPreviousCampaignRequestSupportPage
                                                                }
                                                            >
                                                                <ArrowLeft className="pcc3-icon" />
                                                            </button>
                                                            <button
                                                                disabled={
                                                                    currentCampaignRequestSupportPage >=
                                                                    totalCampaignRequestSupportPages
                                                                }
                                                                onClick={
                                                                    onNextCampaignRequestSupportPage
                                                                }
                                                            >
                                                                <ArrowRight
                                                                    className={`pcc3-icon ${
                                                                        currentCampaignRequestSupportPage >=
                                                                        totalCampaignPages
                                                                            ? "pcc3-icon-disabled"
                                                                            : ""
                                                                    }`}
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    {userLogin?.roleId === 4 && (
                        <>
                            <div className="upps2cr2">
                                <div className="upp-tabs">
                                    <div
                                        className={`upp-tabs-item ${
                                            activeTab === "chiendich"
                                                ? "upp-tabs-item-actived"
                                                : ""
                                        }`}
                                        onClick={() => {
                                            handleTabChange("chiendich"),
                                                handleFilter();
                                        }}
                                    >
                                        Chiến dịch đăng ký
                                    </div>
                                    <div
                                        className={`upp-tabs-item ${
                                            activeTab === "chungchi"
                                                ? "upp-tabs-item-actived"
                                                : ""
                                        }`}
                                        onClick={() => {
                                            handleTabChange("chungchi"),
                                                handleFilter();
                                        }}
                                    >
                                        Xác nhận danh tính
                                    </div>
                                    <div
                                        className={`upp-tabs-item ${
                                            activeTab === "yeucauhotro"
                                                ? "upp-tabs-item-actived"
                                                : ""
                                        }`}
                                        onClick={() => {
                                            handleTabChange("yeucauhotro"),
                                                handleFilter();
                                        }}
                                    >
                                        Đơn yêu cầu hỗ tợ
                                    </div>
                                </div>
                            </div>
                            <div className="upps2cr3">
                                {activeTab === "chiendich" && (
                                    <div className="upp-content">
                                        {currentRegisterReceivers.length ===
                                        0 ? (
                                            <>
                                                <figure>
                                                    <img
                                                        src={NoResult}
                                                        alt=""
                                                    />
                                                </figure>
                                                <h1>Chưa có dữ liệu</h1>
                                            </>
                                        ) : (
                                            <>
                                                <table className="table">
                                                    <thead className="table-head">
                                                        <tr className="table-head-row">
                                                            <th className="table-head-cell">
                                                                Tên người đại
                                                                diện nhận
                                                            </th>
                                                            <th className="table-head-cell">
                                                                Số lượng đăng ký
                                                            </th>
                                                            <th className="table-head-cell">
                                                                Thời gian đăng
                                                                ký
                                                            </th>
                                                            <th className="table-head-cell">
                                                                Hành động
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="table-body">
                                                        {currentRegisterReceiversPage.map(
                                                            (
                                                                registerReceiver,
                                                                index
                                                            ) => (
                                                                <tr
                                                                    className="table-body-row"
                                                                    key={index}
                                                                >
                                                                    <td className="table-body-cell">
                                                                        {
                                                                            registerReceiver.registerReceiverName
                                                                        }
                                                                    </td>
                                                                    <td className="table-body-cell">
                                                                        {
                                                                            registerReceiver.quantity
                                                                        }
                                                                    </td>
                                                                    <td className="table-body-cell">
                                                                        {formatDater(
                                                                            registerReceiver.creatAt
                                                                        )}
                                                                        -
                                                                        {formatTime(
                                                                            registerReceiver.creatAt
                                                                        )}
                                                                    </td>
                                                                    <td className="table-body-cell">
                                                                        <button
                                                                            className="view-btn"
                                                                            onClick={() =>
                                                                                handleToDetailCampaignRecipient(
                                                                                    registerReceiver.campaignId
                                                                                )
                                                                            }
                                                                        >
                                                                            Đi
                                                                            đến
                                                                            chiến
                                                                            dịch
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                                <div className="paginator">
                                                    <div className="p-container">
                                                        <div className="pcc2">
                                                            {
                                                                currentRegisterReceiverPage
                                                            }{" "}
                                                            of{" "}
                                                            {
                                                                totalRegisterReceiverPages
                                                            }
                                                        </div>
                                                        <div className="pcc3">
                                                            <button
                                                                disabled={
                                                                    currentRegisterReceiverPage ===
                                                                    1
                                                                }
                                                                onClick={
                                                                    onPreviousRegisterReceiverPage
                                                                }
                                                            >
                                                                <ArrowLeft className="pcc3-icon" />
                                                            </button>
                                                            <button
                                                                disabled={
                                                                    currentRegisterReceiverPage >=
                                                                    totalRegisterReceiverPages
                                                                }
                                                                onClick={
                                                                    onNextRegisterReceiverPage
                                                                }
                                                            >
                                                                <ArrowRight
                                                                    className={`pcc3-icon ${
                                                                        currentRegisterReceiverPage >=
                                                                        totalRegisterReceiverPages
                                                                            ? "pcc3-icon-disabled"
                                                                            : ""
                                                                    }`}
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                                {activeTab === "chungchi" && (
                                    <div className="upp-content">
                                        <button
                                            className={classNames("pr-btn", {
                                                "disabled-btn":
                                                    profileUser?.isConfirm ===
                                                    true,
                                            })}
                                            onClick={handleConfirmRecipient}
                                        >
                                            {profileUser?.isConfirm === true
                                                ? "Đã được xác minh"
                                                : "Xác minh tài khoản"}
                                        </button>
                                        {currentRecipientCertificates.length ===
                                        0 ? (
                                            <>
                                                <figure>
                                                    <img
                                                        src={NoResult}
                                                        alt=""
                                                    />
                                                </figure>
                                                <h1>Chưa có dữ liệu</h1>
                                            </>
                                        ) : (
                                            <>
                                                <table className="table">
                                                    <thead className="table-head">
                                                        <tr className="table-head-row">
                                                            <th className="table-head-cell">
                                                                Họ và tên
                                                            </th>
                                                            <th className="table-head-cell">
                                                                Số điện thoại
                                                            </th>
                                                            <th className="table-head-cell">
                                                                Lí do đăng ký hỗ
                                                                trợ
                                                            </th>
                                                            <th className="table-head-cell">
                                                                Trạng thái
                                                            </th>
                                                            <th className="table-head-cell">
                                                                Hành động
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="table-body">
                                                        {currentRecipientCertificatesPage.map(
                                                            (row, index) => (
                                                                <tr
                                                                    key={index}
                                                                    className="table-body-row"
                                                                >
                                                                    <td className="table-body-cell">
                                                                        {
                                                                            row.fullName
                                                                        }
                                                                    </td>
                                                                    <td className="table-body-cell">
                                                                        {
                                                                            row.phone
                                                                        }
                                                                    </td>
                                                                    <td className="table-body-cell">
                                                                        {
                                                                            row.registerSupportReason
                                                                        }
                                                                    </td>
                                                                    <td className="table-body-cell">
                                                                        {row.status ===
                                                                        "Pending" ? (
                                                                            <span className="status-pending">
                                                                                Đang
                                                                                chờ
                                                                                phê
                                                                                duyệt
                                                                            </span>
                                                                        ) : row.status ===
                                                                          "Approved" ? (
                                                                            <span className="status-approve">
                                                                                Đã
                                                                                được
                                                                                phê
                                                                                duyệt
                                                                            </span>
                                                                        ) : (
                                                                            <span className="status-reject">
                                                                                Đã
                                                                                bị
                                                                                từ
                                                                                chối
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="table-body-cell">
                                                                        <button
                                                                            className="view-btn"
                                                                            onClick={() =>
                                                                                handleToDetailCertificate(
                                                                                    row.recipientCertificateId,
                                                                                    "Recipient"
                                                                                )
                                                                            }
                                                                        >
                                                                            Xem
                                                                            chi
                                                                            tiết
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                                <div className="paginator">
                                                    <div className="p-container">
                                                        <div className="pcc2">
                                                            {
                                                                currentRecipientCertificatePage
                                                            }{" "}
                                                            of{" "}
                                                            {
                                                                totalRecipientCertificatePages
                                                            }
                                                        </div>
                                                        <div className="pcc3">
                                                            <button
                                                                disabled={
                                                                    currentRecipientCertificatePage ===
                                                                    1
                                                                }
                                                                onClick={
                                                                    onPreviousRecipientCertificatePage
                                                                }
                                                            >
                                                                <ArrowLeft className="pcc3-icon" />
                                                            </button>
                                                            <button
                                                                disabled={
                                                                    currentRecipientCertificatePage >=
                                                                    totalRecipientCertificatePages
                                                                }
                                                                onClick={
                                                                    onNextRecipientCertificatePage
                                                                }
                                                            >
                                                                <ArrowRight
                                                                    className={`pcc3-icon ${
                                                                        currentRecipientCertificatePage >=
                                                                        totalRecipientCertificatePages
                                                                            ? "pcc3-icon-disabled"
                                                                            : ""
                                                                    }`}
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                                {activeTab === "yeucauhotro" && (
                                    <div className="upp-content">
                                        <button
                                            className="pr-btn"
                                            onClick={() =>
                                                setIsRecipientCertificateModalOpen(
                                                    true
                                                )
                                            }
                                        >
                                            Tạo đơn yêu cầu hỗ trợ
                                        </button>
                                        {currentRecipientCertificates.length ===
                                        0 ? (
                                            <>
                                                <figure>
                                                    <img
                                                        src={NoResult}
                                                        alt=""
                                                    />
                                                </figure>
                                                <h1>Chưa có dữ liệu</h1>
                                            </>
                                        ) : (
                                            <>
                                                <table className="table">
                                                    <thead className="table-head">
                                                        <tr className="table-head-row">
                                                            <th className="table-head-cell">
                                                                Họ và tên
                                                            </th>
                                                            <th className="table-head-cell">
                                                                Số điện thoại
                                                            </th>
                                                            <th className="table-head-cell">
                                                                Thời gian tạo
                                                            </th>
                                                            <th className="table-head-cell">
                                                                Hành động
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="table-body">
                                                        {currentRequestSupportsPage.map(
                                                            (row, index) => (
                                                                <tr
                                                                    key={index}
                                                                    className="table-body-row"
                                                                >
                                                                    <td className="table-body-cell">
                                                                        {
                                                                            row.fullName
                                                                        }
                                                                    </td>
                                                                    <td className="table-body-cell">
                                                                        {
                                                                            row.phoneNumber
                                                                        }
                                                                    </td>
                                                                    <td className="table-body-cell">
                                                                        {row?.createdDate
                                                                            ? dayjs(
                                                                                  row.createdDate
                                                                              ).fromNow()
                                                                            : ""}
                                                                    </td>
                                                                    <td className="table-body-cell">
                                                                        <button
                                                                            className="view-btn"
                                                                            onClick={() =>
                                                                                handleToDetailRequestSupport(
                                                                                    row.requestSupportId
                                                                                )
                                                                            }
                                                                        >
                                                                            Xem
                                                                            chi
                                                                            tiết
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                                <div className="paginator">
                                                    <div className="p-container">
                                                        <div className="pcc2">
                                                            {
                                                                currentRequestSupportPage
                                                            }{" "}
                                                            of {totalNewsPages}
                                                        </div>
                                                        <div className="pcc3">
                                                            <button
                                                                disabled={
                                                                    currentRequestSupportPage ===
                                                                    1
                                                                }
                                                                onClick={
                                                                    onPreviousRequestSupportPage
                                                                }
                                                            >
                                                                <ArrowLeft className="pcc3-icon" />
                                                            </button>
                                                            <button
                                                                disabled={
                                                                    currentRequestSupportPage >=
                                                                    totalNewsPages
                                                                }
                                                                onClick={
                                                                    onNextRequestSupportPage
                                                                }
                                                            >
                                                                <ArrowRight
                                                                    className={`pcc3-icon ${
                                                                        currentRequestSupportPage >=
                                                                        totalNewsPages
                                                                            ? "pcc3-icon-disabled"
                                                                            : ""
                                                                    }`}
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </section>
            <SubmitCertificateModal
                isOpen={isSubmitCertificateModalOpen}
                setIsOpen={setIsSubmitCertificateModalOpen}
            />
            <CreateCampaignModal
                isOpen={isCreateCampaignModalOpen}
                setIsOpen={setIsCreateCampaignModalOpen}
            />
            <RecipientCertificateModal
                isOpen={isRecipientCertificateModalOpen}
                setIsOpen={setIsRecipientCertificateModalOpen}
            />
            <CancelCampaignModal
                isOpen={isCancelCampaignModalOpen}
                setIsOpen={setIsCancelCampaignModalOpen}
                selectedCampaign={selectedCancelCampaign}
            />
        </main>
    );
};

export default UserPersonalPage;
