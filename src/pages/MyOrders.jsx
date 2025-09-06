import React, { useState, useEffect, useCallback } from 'react';
import { Order } from '@/api/entities';
import { User } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { Truck, Package, Clock, CheckCircle2, XCircle, ArrowLeft, Loader2, PlayCircle } from 'lucide-react';

const statusConfig = {
    pendente: { label: 'Pendente', icon: Clock, color: 'bg-yellow-500' },
    confirmado: { label: 'Confirmado', icon: CheckCircle2, color: 'bg-blue-500' },
    preparando: { label: 'Preparando', icon: Package, color: 'bg-indigo-500' },
    saiu_entrega: { label: 'Saiu para Entrega', icon: Truck, color: 'bg-purple-500' },
    entregue: { label: 'Entregue', icon: CheckCircle2, color: 'bg-green-500' },
    cancelado: { label: 'Cancelado', icon: XCircle, color: 'bg-red-500' },
};

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setDarkMode(isDark);
        const observer = new MutationObserver(() => {
            setDarkMode(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const loadOrders = useCallback(async (userEmail) => {
        if (!userEmail) return;
        setLoading(true);
        setError(null);
        try {
            const userOrders = await Order.filter({ customer_email: userEmail }, '-created_date');
            setOrders(userOrders);
        } catch (err) {
            console.error("Erro ao buscar pedidos:", err);
            setError("Não foi possível carregar seus pedidos. Tente novamente mais tarde.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const user = await User.me();
                setCurrentUser(user);
                loadOrders(user.email);
            } catch (e) {
                navigate(createPageUrl('Store'));
            }
        };
        checkUser();
    }, [loadOrders, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
                <XCircle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Ocorreu um erro</h2>
                <p className="text-red-500">{error}</p>
                <Button onClick={() => loadOrders(currentUser.email)} className="mt-6">Tentar Novamente</Button>
            </div>
        );
    }

    return (
        <div className={`min-h-screen p-4 sm:p-6 md:p-8 ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center mb-8">
                    <Button variant="ghost" onClick={() => navigate(createPageUrl('Store'))} className="mr-4">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-3xl font-bold">Meus Pedidos</h1>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-16">
                        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">Nenhum pedido encontrado</h2>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Você ainda não fez nenhum pedido. Que tal começar agora?</p>
                        <Button onClick={() => navigate(createPageUrl('Store'))} className="mt-6">
                            Ir para a Loja
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {(orders || []).map(order => {
                            if (!order || !order.id) return null;

                            const Icon = statusConfig[order.status]?.icon || Package;
                            const statusColor = statusConfig[order.status]?.color || 'bg-gray-500';
                            const createdDate = order.created_date ? new Date(order.created_date) : null;

                            return (
                                <Card key={order.id} className={`overflow-hidden transition-all duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white shadow-sm'}`}>
                                    <CardHeader className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-row items-center justify-between`}>
                                        <div>
                                            <CardTitle className="text-lg">Pedido #{order.id.slice(0, 8)}</CardTitle>
                                            <CardDescription>{createdDate ? createdDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Data indisponível'}</CardDescription>
                                        </div>
                                        <Badge className={`text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 ${statusColor}`}>
                                            <Icon className="w-4 h-4" />
                                            <span>{statusConfig[order.status]?.label || 'Desconhecido'}</span>
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-4">
                                        <div>
                                            <h4 className="font-semibold mb-2">Itens:</h4>
                                            <ul className="space-y-3">
                                                {(order.items || []).map((item, index) => {
                                                    if (!item) return null;
                                                    
                                                    const digitalContent = item.digital_content || '';
                                                    const isCourse = digitalContent.startsWith('course_access:');
                                                    const courseId = isCourse ? digitalContent.replace('course_access:', '') : null;

                                                    return (
                                                        <li key={index} className="flex items-center gap-4">
                                                            <img src={item.image_url || 'https://via.placeholder.com/150'} alt={item.product_name || 'Produto'} className="w-16 h-16 object-cover rounded-md" />
                                                            <div className="flex-1">
                                                                <p className="font-medium">{item.product_name || 'Produto indisponível'}</p>
                                                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{(item.quantity || 1)} x R$ {(item.unit_price || 0).toFixed(2)}</p>
                                                                
                                                                {isCourse && courseId && (
                                                                    <Button
                                                                        onClick={() => navigate(createPageUrl(`CoursePlayer?courseId=${courseId}`))}
                                                                        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                                                                        size="sm"
                                                                    >
                                                                        <PlayCircle className="w-4 h-4 mr-2" />
                                                                        Acessar Curso
                                                                    </Button>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-semibold">R$ {(item.total || 0).toFixed(2)}</p>
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    </CardContent>
                                    <CardFooter className={`p-4 flex justify-end ${darkMode ? 'bg-gray-800/50 border-t border-gray-700' : 'bg-gray-50'}`}>
                                        <span className="text-lg font-bold">Total: R$ {(order.final_total || order.total_amount || 0).toFixed(2)}</span>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}